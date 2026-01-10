import { Metadata } from "next";
import ServerGet from "./ServerGet";

export const metadata: Metadata = {
  title : "My Servers",
}


export default function ServerGetPage(){
  return <ServerGet/>
}