// Local integration data only; never used by the app or executed on startup.
const {randomUUID,randomBytes}=require('node:crypto');
const {mkdir,writeFile,readFile}=require('node:fs/promises');
const {PostgresDatabase}=require('../../backend/dist/src/platform/database');
const {provision}=require('../../backend/dist/src/modules/identity/identity.factory');
const {ScryptPasswordHasher}=require('../../backend/dist/src/modules/identity/infrastructure/node-credentials');
const {loginSchema,companyNameSchema}=require('../../backend/dist/src/modules/identity/http/identity.schemas');

async function main() {
  const url=new URL(process.env.DATABASE_URL);
  if(url.hostname!=='localhost' || url.port!=='5433' || url.pathname!=='/salinas') throw new Error('Only the dedicated local integration database is allowed');
  const db=new PostgresDatabase(url.toString());
  try {
    if(process.argv[2]==='configure-login') {
      const fixture=JSON.parse(await readFile('.integration/fixture.json','utf8'));
      const input=loginSchema.parse({company:process.env.COMPANY_SLUG,email:process.env.USER_EMAIL,password:process.env.USER_PASSWORD});
      const name=companyNameSchema.parse(process.env.COMPANY_NAME);
      const passwordHash=await new ScryptPasswordHasher().hash(input.password);
      await db.transaction(async tx=>{
        const members=await tx.query('SELECT user_id FROM memberships WHERE id=$1 AND company_id=$2 AND user_id=$3 FOR UPDATE',[fixture.membershipId,fixture.companyId,fixture.userId]);
        if(members.length!==1) throw new Error('Fixture membership does not match');
        const users=await tx.query('UPDATE users SET email=$1,password_hash=$2,failures=0,blocked_until=NULL WHERE id=$3 AND email=$4 RETURNING id',[input.email,passwordHash,fixture.userId,fixture.email]);
        const companies=await tx.query('UPDATE companies SET slug=$1,name=$2 WHERE id=$3 AND slug=$4 RETURNING id',[input.company,name,fixture.companyId,fixture.company]);
        if(users.length!==1 || companies.length!==1) throw new Error('Fixture identity or company changed unexpectedly');
        await tx.query('DELETE FROM sessions WHERE membership_id IN (SELECT id FROM memberships WHERE user_id=$1)',[fixture.userId]);
      });
      await writeFile('.integration/fixture.json',JSON.stringify({...fixture,company:input.company,email:input.email,password:input.password},null,2));
      console.log('Local fixture login updated; existing field history preserved and old sessions revoked.');
      return;
    }
    if(process.argv[2]==='verify') {
      const fixture=JSON.parse(await readFile('.integration/fixture.json','utf8'));
      const [day]=await db.query('SELECT status FROM workdays WHERE company_id=$1 AND membership_id=$2 ORDER BY started_at DESC LIMIT 1',[fixture.companyId,fixture.membershipId]);
      const [visit]=await db.query('SELECT status,result,observations FROM visits WHERE company_id=$1 AND id=$2',[fixture.companyId,fixture.visitId]);
      if(day?.status!=='completed' || visit?.status!=='completed' || visit?.result!=='attended' || visit?.observations!=='Verificación web: guardado en PostgreSQL.') throw new Error('Browser changes were not persisted as expected');
      console.log('Verified: completed workday, attended visit and exact observations persisted in PostgreSQL.');
      return;
    }
    const tag=randomUUID().slice(0,8);
    const company='web-'+tag,email='field-'+tag+'@example.invalid',password=randomBytes(24).toString('base64url');
    const owner=await provision(db,company,'Empresa de prueba '+tag,email,password,'America/Lima');
    const secondCompany='other-'+tag;
    const other=await provision(db,secondCompany,'Otra empresa '+tag,email,password,'America/Lima');
    const customerId=randomUUID(),visitId=randomUUID();
    await db.transaction(async tx=>{
      await tx.query('INSERT INTO customers(id,company_id,name,address) VALUES($1,$2,$3,$4)',[customerId,owner.companyId,'Cliente de prueba '+tag,'Dirección de prueba']);
      await tx.query('INSERT INTO customer_assignments(company_id,customer_id,membership_id) VALUES($1,$2,$3)',[owner.companyId,customerId,owner.membershipId]);
      await tx.query('INSERT INTO visits(id,company_id,membership_id,customer_id,scheduled_at) VALUES($1,$2,$3,$4,now())',[visitId,owner.companyId,owner.membershipId,customerId]);
    });
    await mkdir('.integration',{recursive:true});
    await writeFile('.integration/fixture.json',JSON.stringify({...owner,company,email,password,visitId,customerId,secondCompany,otherMembershipId:other.membershipId},null,2));
    console.log('Local field fixture created in ignored .integration/fixture.json.');
  } finally {await db.close();}
}
main().catch(()=>{console.error('Local integration fixture failed. Check database and test preconditions.');process.exitCode=1;});
