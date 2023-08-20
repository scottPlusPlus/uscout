import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { useTransition } from "@remix-run/react";
import LoadingText from "~/components/LoadingText";
// import Image3x2 from "~/components/Image3x2";
import JSONViewer from "~/components/JSONViewer";
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
import { requestGpttags } from "~/code/scout/chatgpt";
import scrapePage from "../../code/scout/ScrapePage.server";

import * as createError from 'http-errors';


export const action = async ({ request }: ActionArgs) => {
    console.log(nowHHMMSS() + ": Server: gPttags Action");

    const formData = await request.formData();
    const inputURL = formData.get("url");

    invariant(
        typeof inputURL === "string",
        "input Collection must be a string"
    );

    try {
        const scrape = await scrapePage(inputURL, false);
        const summary = scrape.summary;
        const title = scrape.title;
        const prompt =
          "Assign 5 unique tags that best represent this summary: " +
          summary +
          "and this title: " +
          title +
          ". Respond with 5 tags in best order it represents.";
        // const scrapeInfo = await requestGpttags(prompt);
        return { info: prompt };
    } catch (err) {
        console.log(err);
        if (err instanceof createError.HttpError) {
            if (err.status > 399 && err.status < 500){
                return json(
                    { error: err.message },
                    {
                      status: err.status,
                    }
                );
            }
        }
        return json(
            { error: "We had trouble with that Collection. Please try again later." },
            {
              status: 500,
            }
        );
    }
};

export default function Gpttags() {
    const data = useActionData();
    const info = !data ? null : !data.info ? null : data.info;
    const err = !data ? null : !data.error ? null : data.error;
    const transition = useTransition();
    const loading = transition.state === "submitting";
    // const infoImage = !info ? null : !info.image ? null : info.image;

    return (
        <div className="flex flex-col items-center h-screen">
            <Form
                method="post"
                id="upload-form"
                className="w-full md:w-1/2 max-w-sm mx-auto md:mx-0 md:mr-2"
            >
                <div className="flex items-center border-b border-b-2 border-teal-500 py-2">
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        type="string"
                        placeholder="URL"
                        name="url"
                        required
                    />
                    <button
                        className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
                {err && <p className="text-red-500 text-xs italic">{err}</p>}
            </Form>
            <div className="w-full md:w-1/2 max-w-sm mx-auto md:mx-0 md:mr-2">
                {loading ? (
                    <LoadingText />
                ) : null}
                {info ? (
                    <>
                        <h2 className="text-lg font-medium leading-6 text-gray-900">
                            Result
                        </h2>
                        <div data-test="jsonDisplay" className="mt-1 text-sm text-gray-600 overflow-x-auto overflow-wrap-break-word word-wrap-break-word white-space-normal max-width-100">
                            <JSONViewer dataObj={info}/>
                        </div>
                    </>
                ) : null}
                {/* {infoImage ? (
                    <Image3x2 src={infoImage}/>
                ) : null} */}
            </div>
        </div>
    );
}