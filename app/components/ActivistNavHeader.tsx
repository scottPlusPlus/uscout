import { CSS_ACTIVIST_CLASSES } from "~/code/front/CssClasses"


export default function ActivistNavHeader(props: {ipab:number}) {
    const myCss = CSS_ACTIVIST_CLASSES(props.ipab);
    return (
        <>
            <nav className={"fixed top-0 left-0 w-full py-4 z-10 "+myCss.navColor}>
            <div className="px-4 lg:px-8 flex justify-between">
            <div className="flex items-left">
                <a href="#top" className="text-white text-xl font-semibold">Empower-Kit for Activists 🧰</a>
            </div>
            <div className="flex items-center">
                <a href="./feedback?r=activists" className={myCss.navButton}>Feedback</a>
                <a href="#top" className={myCss.navButton}>Back to Top</a>
            </div>
            </div>
        </nav>
        <div className="py-8"></div>
      </>
    )

}