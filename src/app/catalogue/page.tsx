"use client"

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Course, columns } from "./columns";
import { DataTable } from "./data-table";
import { ProgramSelector } from "./program-selector";
import { supabase } from "@/lib/supabaseClient";
import Loading from "../loading";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Footer from "@/components/footer";

// Define the Supabase Course type
type SupabaseCourse = {
  id: number;
  code: string;
  name: string;
  description: string;
  weekly_contact: string;
  gpa_weight: string;
  billing_unit: string;
  course_count: string;
  prerequisites: string;
  corequisites: string;
  antirequisites: string;
  custom_requisites: string;
  department_id: number;
  liberal: string;
  term: string[];
}

// Define the Department type
type Department = {
  id: number;
  name: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Catalogue() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string[]>([]);



  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching departments:', error);
          setDepartments([]);
        } else {
          setDepartments(data || []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('courses')
          .select('*')
          .order('code');

        // Filter by selected departments if any are selected
        if (selectedDepartments.length > 0) {
          query = query.in('department_id', selectedDepartments);
        }

        const typeMap = {
          "Lower liberal": "LL",
          "Upper liberal": "UL"
        };
        const supabaseTypes = selectedTypes.map(t => typeMap[t as keyof typeof typeMap]);

        if (supabaseTypes.length > 0) {
          query = query.in('liberal', supabaseTypes);
        }

        if (selectedTerm.length > 0) {
          query = query.overlaps('term', selectedTerm);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching courses:', error);
          setCourses([]);
        } else {
          // Transform Supabase data to match our Course interface
          const transformedCourses: Course[] = (data || []).map((course: SupabaseCourse) => ({
          code: course.code,
          name: course.name,
          description: course.description,
          "weekly contact": course.weekly_contact,
          "gpa weight": course.gpa_weight,
          "billing unit": course.billing_unit,
          "course count": course.course_count,
          prerequisites: course.prerequisites,
          corequisites: course.corequisites,
          antirequisites: course.antirequisites,
          "custom requisites": course.custom_requisites,
          liberal: course.liberal,
          term: course.term
        }));
          setCourses(transformedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        await sleep(750);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedDepartments, selectedTypes, selectedTerm]);

  const handleDepartmentToggle = (departmentId: number) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleDepartmentRemove = (departmentName: string) => {
    const department = departments.find(dept => dept.name === departmentName);
    if (department) {
      handleDepartmentToggle(department.id);
    }
  };

  const handleClearSelection = () => {
    setSelectedDepartments([]);
  };

  if (loading && courses.length === 0) {
    return <Loading />;
  }

  const handleTypeToggle = (typeName: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeName)
        ? prev.filter(t => t !== typeName)
        : [...prev, typeName]
    );
  };

  const handleClearTypeSelection = () => {
    setSelectedTypes([]);
  };

const handleTermToggle = (termName: string) => {
  setSelectedTerm(prev =>
    prev.includes(termName)
      ? prev.filter(t => t !== termName)
      : [...prev, termName]
  );
};

  const handleClearTermSelection = () => {
    setSelectedTerm([]);
  };

  return (
    <main className="min-h-screen bg-foreground pt-5">
      <Navbar/>
      <div className="flex flex-col items-center mb-10">
        <div className="flex flex-col items-center justify-center p-8 w-full max-w-8xl mt-30 gap-4 text-center">
            <h1 className="text-[70px] font-[800] text-secondary" >Course Catalogue</h1>
            <p className="text-[20px] font-[400] text-white">Browse all current courses at TMU. Search, filter, and discover classes by course code, department, or keyword.</p>
        </div>        
          <DataTable 
            columns={columns} 
            data={courses} 
            topContent={
              <div className="flex flex-row items-center w-full max-w-3xl gap-10">
                <ProgramSelector 
                  programs={departments.map(dept => dept.name)} 
                  selectedPrograms={departments
                    .filter(dept => selectedDepartments.includes(dept.id))
                    .map(dept => dept.name)
                  }
                  onProgramToggle={(programName: string) => {
                    const department = departments.find(dept => dept.name === programName);
                    if (department) {
                      handleDepartmentToggle(department.id);
                    }
                  }}
                  onClearSelection={handleClearSelection}
                />
                <div className="flex flex-row text-white text-sm items-center bg-black/30 border-secondary border-2 p-2 rounded-lg">
                  <p className="mr-3">Type: </p>
                  <div className="flex flex-row gap-3">                    
                    <button
                      className={`px-4 py-1 rounded-lg font-semibold text-sm hover:opacity-80 hover:cursor-pointer
                        ${selectedTypes.includes("Lower liberal") ? "bg-blue-400  text-black" : "bg-white text-black"}`}
                      onClick={() => handleTypeToggle("Lower liberal")}
                    >
                      Lower
                    </button>

                    <button
                      className={`px-4 py-1 rounded-lg font-semibold text-sm hover:opacity-80 hover:cursor-pointer
                        ${selectedTypes.includes("Upper liberal") ? "bg-blue-400  text-black" : "bg-white text-black"}`}
                      onClick={() => handleTypeToggle("Upper liberal")}
                    >
                      Upper
                    </button>
                  </div>
                </div>
                <div className="flex flex-row text-white text-sm items-center bg-black/30 border-secondary border-2 p-2 rounded-lg">
                  <p className="mr-3">Term: </p>
                  <div className="flex flex-row gap-3">
                   <button
                      className={`px-4 py-1 rounded-lg font-semibold text-sm hover:opacity-80 hover:cursor-pointer
                        ${selectedTerm.includes("Fall") ? "bg-blue-400  text-black" : "bg-white text-black"}`}
                      onClick={() => handleTermToggle("Fall")}
                    >
                      Fall
                    </button>

                    <button
                      className={`px-4 py-1 rounded-lg font-semibold text-sm hover:opacity-80 hover:cursor-pointer
                        ${selectedTerm.includes("Winter") ? "bg-blue-400 text-black" : "bg-white text-black"}`}
                      onClick={() => handleTermToggle("Winter")}
                    >
                      Winter
                    </button>
                  </div>
                </div>
            </div>
            }
            belowSearchContent={
              (selectedDepartments.length > 0 || selectedTypes.length > 0 || selectedTerm.length > 0) && (
                <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-blue-200 font-semibold mr-2">Selected:</span>
                    {departments
                      .filter(dept => selectedDepartments.includes(dept.id))
                      .map(dept => (
                        <Badge
                          key={dept.id}
                          variant="secondary"
                          className="bg-[#F9DD4A] text-black hover:bg-[#F9DD4A]/80 border-[#F9DD4A] cursor-pointer group flex items-center gap-1"
                          onClick={() => handleDepartmentRemove(dept.name)}
                        >
                          {dept.name}
                          <X className="h-3 w-3 group-hover:text-red-600 transition-colors" />
                        </Badge>
                      ))}
                    {selectedTypes.map(type => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="bg-[#60a5fa] text-black hover:bg-[#38bdf8]/80 border-[#60a5fa] cursor-pointer group flex items-center gap-1"
                        onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                      >
                        {type}
                        <X className="h-3 w-3 group-hover:text-red-600 transition-colors" />
                      </Badge>
                    ))}
                    {selectedTerm.map(term => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="bg-[#60a5fa] text-black hover:bg-[#38bdf8]/80 border-[#60a5fa] cursor-pointer group flex items-center gap-1"
                        onClick={() => setSelectedTerm(selectedTerm.filter(t => t !== term))}
                      >
                        {term}
                        <X className="h-3 w-3 group-hover:text-red-600 transition-colors" />
                      </Badge>
                    ))}
                    {(selectedDepartments.length > 0 || selectedTypes.length > 0 || selectedTerm.length > 0) && (
                      <Badge
                        variant="outline"
                        className="bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-red-800/50 hover:border-red-600 hover:text-white cursor-pointer"
                        onClick={() => {
                          handleClearSelection();
                          handleClearTypeSelection();
                          handleClearTermSelection();
                        }}
                      >
                        Clear All
                      </Badge>
                    )}
                  </div>
                </div>
              )
            }
          />
        </div>

        <Footer/>
    </main>
  );
}