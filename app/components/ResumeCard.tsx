import React, { useEffect, useState } from 'react'
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const [resumeUrl, setResumeUrl] = useState("");
    const { fs } = usePuterStore();

    useEffect(() => {
        let revokedUrl = "";
        const loadResume = async () => {
            try {
                if (!imagePath) return;
                const blob = await fs.read(imagePath);
                if (!blob) return;
                // Revoke any previous URL to avoid memory leaks
                if (resumeUrl) {
                    URL.revokeObjectURL(resumeUrl);
                }
                const url = URL.createObjectURL(blob);
                revokedUrl = url;
                setResumeUrl(url);
            } catch (err) {
                console.warn("Failed to load resume preview from", imagePath, err);
                setResumeUrl("");
            }
        };
        loadResume();
        return () => {
            if (revokedUrl) URL.revokeObjectURL(revokedUrl);
        };
    }, [fs, imagePath]);

    return (
        <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
            <div className='resume-card-header'>
                <div className='flex flex-col gap-2'>
                    {companyName && <h2 className='!text-black font-bold break-words'>{companyName}</h2>}
                    {jobTitle && <h3 className='text-sm break-words text-grey-500'>{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className='text-black font-bold'>Resume</h2>}
                </div>
                <div className='flex-shrink-0'>
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className='gradient-border animate-in fade-in duration-1000'>
                    <div className='w-full h-full'>
                        <img
                            src={resumeUrl}
                            alt='resume preview'
                            className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'
                        />
                    </div>
                </div>
            )}
        </Link>
    )
}
export default ResumeCard
