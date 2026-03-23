import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const parseFeedbackJson = (raw: string): Feedback => {
    try {
        return JSON.parse(raw) as Feedback;
    } catch {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');

        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(raw.slice(start, end + 1)) as Feedback;
        }

        throw new Error('AI did not return valid JSON feedback.');
    }
};

const Upload = () => {

    const { auth, isLoading, fs, ai,kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [statusText, setStatusText] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file } : {companyName : string, jobTitle : string, jobDescription : string, file : File}) => {
        setIsProcessing(true);

        try {
            setStatusText("Uploading the file...");

            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('Error: Failed to upload file.');
                return;
            }

            setStatusText('Converting to image...');

            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                setStatusText(`Error: Failed to convert PDF to image. ${imageFile.error ?? ''}`.trim());
                return;
            }

            setStatusText("Uploading the image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setStatusText('Error: Failed to upload image.');
                return;
            }

            setStatusText("Preparing data...");

            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }

            await kv.set(`resume:${uuid}`,JSON.stringify(data));

            setStatusText("Analyzing...");

            // OCR the generated image so feedback can still be accurate
            // when direct PDF parsing is inconsistent on the model side.
            const extractedText = await ai.img2txt(imageFile.file);

            const analysisInstructions = prepareInstructions({
                jobTitle,
                jobDescription,
                resumeText: extractedText,
            });

            const feedback = await ai.feedback(
                uploadedImage.path,
                analysisInstructions
            );

            if(!feedback) {
                setStatusText('Error: Failed to analyze resume. Please try again.');
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = parseFeedbackJson(feedbackText);
            await kv.set(`resume:${uuid}`,JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unexpected error while analyzing resume.';

            setStatusText(`Error: ${message}`);
        } finally {
            setIsProcessing(false);
        }

    }


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);


        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }


    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className='main-section'>
                <div className='page-heading py-16'>
                    <h1>Smart feedback for your dream job!</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src='/images/resume-scan.gif' alt='Resume analysis in progress' className='w-full' />
                        </>
                    ):(
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                        </>
                    )}
                    {!isProcessing && (
                        <>
                            <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
                                <div className='form-div'>
                                    <label htmlFor="company-name">Company Name</label>
                                    <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                                </div>
                                <div className='form-div'>
                                    <label htmlFor="job-title">Job Title</label>
                                    <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                                </div>
                                <div className='form-div'>
                                    <label htmlFor="job-description">Job Description</label>
                                    <textarea rows={5} name="job-description" placeholder="Job Description" id="jjob-description" />
                                </div>
                                <div className='form-div'>
                                    <label htmlFor="uploader">Upload Resume</label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>

                                <button className='primary-button' type='submit'>
                                    Analyze Resume
                                </button>

                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
