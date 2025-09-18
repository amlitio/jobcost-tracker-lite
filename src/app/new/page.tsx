"use client";
import AuthGate from "@/components/AuthGate";
import JobForm from "@/components/JobForm";
export default function NewJobPage(){ return <AuthGate><JobForm/></AuthGate>; }

