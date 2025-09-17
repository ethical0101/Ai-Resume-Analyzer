import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";


export function meta({}: Route.MetaArgs)
{
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const {auth, kv} = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false);

  useEffect(()=>{
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  },[auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      try {
        const list = (await kv.list(`resume:*`, true)) as KVItem[] | undefined;

        const parsedResumes = (list ?? [])
          .map((item) => {
            try {
              return JSON.parse(item.value) as Resume;
            } catch {
              return undefined;
            }
          })
          .filter((r): r is Resume => !!r && typeof r.id === "string");

        console.log("parsedResumes", parsedResumes);
        setResumes(parsedResumes);
      } catch (e) {
        console.error("Failed to load resumes", e);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();

  }, []);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className='main-section'>
      <div className='page-heading py-16'>
        <h1>
          Track Your Application & Resume Ratings
        </h1>
        {!loadingResumes && resumes.length === 0 ? (
            <h2>
              No resumes found. Upload your first resume to get feedback.
            </h2>
        ):(
            <h2>
              Review your submission & Get AI-Powered feedback.
            </h2>
        )}
      </div>
      {loadingResumes && (
          <div className='flex flex-col items-center justify-center'>
            <img
              src="/images/resume-scan-2.gif" className='w-[200px]'
            />
          </div>
      )}
      {!loadingResumes && resumes.length > 0 && (
          <div className='resumes-section'>
            {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
      )}

      {!loadingResumes && resumes.length > 0 && (
            <div className='flex flex-col items-center justify-center mt-10 gap-4'>
              <Link to='/upload' className="primary-button w-fit text-xl font-semibold">
                Upload Resume
              </Link>
            </div>
          )
      }
    </section>

  </main>;
}
