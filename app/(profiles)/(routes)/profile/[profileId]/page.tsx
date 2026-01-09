import { Metadata } from "next";
import ProfileIdPage from "./ProfileIdPage";

export const metadata:Metadata = {
  title: "My Profile"
};

export default function ProfileGet(){
  return <ProfileIdPage/>
};