import {NextRequest,NextResponse} from 'next/server';
import {createProxy,loadProxyConfig} from '@/shared/api/proxy';

export const dynamic='force-dynamic';
async function handle(request:NextRequest,{params}:{params:{path:string[]}}) {
  try {return await createProxy(loadProxyConfig(process.env))(request,params.path);}
  catch(error) {
    const requestId=crypto.randomUUID();
    console.error(JSON.stringify({event:'field_proxy_configuration_error',requestId,errorType:error instanceof Error?error.name:'unknown'}));
    return NextResponse.json({code:'proxy_configuration_error',message:'La conexión con la API no está configurada correctamente.',requestId},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
export const GET=handle;
export const POST=handle;
