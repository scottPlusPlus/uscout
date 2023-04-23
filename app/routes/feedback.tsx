import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/server-runtime";
import { useRef, useState } from "react";
import { CSS_CLASSES } from "~/code/CssClasses";
import { getStringOrFallback, getStringOrThrow } from "~/code/formUtils";
import { getIpAddress } from "~/code/ipUtils";
import { addFeedback } from "~/models/feedback.server";


export async function action({ request, params }: ActionArgs) {
    console.log("running scout admin action");
    console.log("url = " + request.url);
    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const r = searchParams.get("r");

    const formData = await request.formData();
    const feedback = getStringOrThrow(formData, "feedback");
    const email = getStringOrFallback(formData, "email", "");
    console.log(`feedback sumbitted: ${email}:  ${feedback}`);

    const ip = getIpAddress(request);
    addFeedback(ip, r ?? "", feedback, email);

    var destination = "./";
    if (r!= null){
        destination="/"+r;
    }
    console.log("destination = " + destination);
    return redirect(destination);
}


// export async function loader({ request, params }: LoaderArgs) {
// };

export default function FeedbackPage() {

    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const submit = useSubmit();
    const formRef = useRef<HTMLFormElement>(null); //Add a form ref.

    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const emailInput = event.target.value;
        setEmail(emailInput);
        setEmailError(
            emailInput.length > 0 && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(emailInput)
                ? 'Please enter a valid email'
                : ''
        );
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log({ feedback, email });

        const formData = new FormData(formRef.current || undefined)
        formData.set("feedback", feedback);
        formData.set("email", email);

        submit(formData, { method: "post" });
        console.log("done");
        setFeedback("");
        setEmail("");
        // Send feedback and email data to your API or service here
    };

    return (
        // <div className="flex flex-col items-center h-screen">
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Feedback</h1>

            <form onSubmit={handleSubmit} className="mx-auto mx-8">
                <p>We're actively looking to make this site more helpful. Please let us know if you have any suggestions.</p>
                <div className="mb-4 pt-4">
                    <textarea
                        id="feedback"
                        name="feedback"
                        rows={5}
                        value={feedback}
                        onChange={handleFeedbackChange}
                        className={"w-full " + CSS_CLASSES.INPUT_FIELD}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                        Email (optional):
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={"w-full " + CSS_CLASSES.INPUT_FIELD}
                    // className={`w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 ${emailError && 'border-red-500'
                    //     }`}
                    />
                    {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
                </div>
                <button type="submit" className={CSS_CLASSES.SUBMIT_BUTTON}>
                    Submit
                </button>
            </form>
            <Form ref={formRef} className="invisible"></Form>
        </div>
    );
}
