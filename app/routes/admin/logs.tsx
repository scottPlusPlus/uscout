import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/server-runtime";
import { recentLogs } from "~/code/log/logger";
import { JarvisPage } from "~/components/JarvisPage";


export async function loader({ request, params }: LoaderArgs) {
    try {
        const myRecentLogs = await recentLogs();
        console.log("how many recent logs?  " + myRecentLogs.length);
        return json({ logs: myRecentLogs});
    } catch {
        console.log("failed to getData for Emails");
        return json({ logs: []});
    }
};


export default function LogsPage() {
    const serverData = useLoaderData<typeof loader>();
    console.log("got server data...");
    const myLogs:string[] = serverData.logs;
    // if (!Array.isArray(myLogs)){
    //     console.log("myLogs not array??");
    //     return <div>fuck</div>
    // }
    // const first = myLogs[0];
    // const t = typeof first;
    // console.log("myLogs is a... " + t);
    // return (
    //     <div> fucks</div>
    // )

    return (
        <JarvisPage>
            <div className="pb-8 text-white">
                <h2 className="text-2xl font-bold">Logs:</h2>
                <div className="space-y-2">
                    {myLogs.map((item, index) => {
                        return (
                            <div key={index}>{item}</div>
                        )
                    })}
                </div>
            </div>
        </JarvisPage>
    );
}