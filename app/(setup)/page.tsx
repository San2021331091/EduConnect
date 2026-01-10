import { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
    title: "Create A Server"
};

export default function HomePageGet(){
  return <HomePage/>
}