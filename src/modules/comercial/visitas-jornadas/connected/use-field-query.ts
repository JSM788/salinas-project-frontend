"use client";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, errorText } from "@/shared/api/client";
import { runIdempotentCommand } from "@/shared/api/idempotent-command";
import { FieldFilters, fieldMemberSchema, teamAgendaSchema, teamWorkdaysSchema, teamRoutes } from "@/shared/api/field-management";
import { agendaSchema, customerSchema, fieldRoutes, workdaySchema, type Customer, type Visit, type Workday } from "@/shared/api/contracts";
import { pageSchema, queryPath } from "@/shared/api/pagination";
import { useResource, useDirectory } from "@/modules/platform/use-resource";

export function useField(team:boolean, filters:FieldFilters, view:string) {
  const client=useQueryClient();
  const [commandError,setCommandError]=useState("");
  const [mutating,setMutating]=useState(false);
  const keys=useRef(new Map<string,string>());
  const lock=useRef(false);
  const params:Record<string,string|number|undefined>={...filters,page:typeof filters.page==="number"?filters.page:1,pageSize:25};
  const agendaParams={...params,...(view==="registros"?{date:undefined,workdayDate:filters.date as string|undefined,status:"completed"}: {})};
  const visits=useResource(view!=="jornadas"?queryPath(team?teamRoutes.agenda:fieldRoutes.agenda,agendaParams):undefined,team?pageSchema(teamAgendaSchema.element):pageSchema(agendaSchema.element));
  const days=useResource(view==="jornadas"?queryPath(team?teamRoutes.workdays:fieldRoutes.workdays,params):undefined,team?pageSchema(teamWorkdaysSchema.element):pageSchema(workdaySchema));
  const members=useDirectory(team?teamRoutes.members:undefined,fieldMemberSchema);
  const customers=useDirectory(!team?fieldRoutes.customers:undefined,customerSchema);
  const hasData=view==="jornadas"?Boolean(days.data):Boolean(visits.data);
  const error=commandError || visits.error || days.error || members.error || customers.error;
  const reload=async()=>{
    setCommandError("");
    await Promise.all([visits.refresh(),days.refresh()]);
  };
  const mutate=async(path:string,body:unknown,schema:z.ZodType<unknown>,onError?:(cause:unknown)=>void)=>{
    if(lock.current)return false;
    lock.current=true;setMutating(true);setCommandError("");
    try {
      await runIdempotentCommand(keys.current,JSON.stringify([path,body]),key=>apiRequest(path,schema,{body,key}));
      await client.invalidateQueries({queryKey:["api"]});
      return true;
    } catch(cause){if(onError)onError(cause);else setCommandError(errorText(cause));await client.invalidateQueries({queryKey:["api"]});return false;}
    finally{lock.current=false;setMutating(false);}
  };
  return {
    data:hasData?{visits:(visits.data?.items??[]) as (Visit&{member_email?:string;member_role?:"commercial"|"merchandiser"|null})[],workdays:(days.data?.items??[]) as (Workday&{member_email?:string;member_role?:"commercial"|"merchandiser"|null})[],members:members.data??[],customers:(customers.data??[]) as Customer[],total:view==="jornadas"?(days.data?.total??0):(visits.data?.total??0)}:null,
    error,busy:mutating,loading:visits.loading||days.loading,stale:false,reload,mutate,
  };
}
