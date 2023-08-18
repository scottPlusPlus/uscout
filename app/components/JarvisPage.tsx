type Props = {
    children: React.ReactNode,
}

export function JarvisPage(props: Props) {
    return (
        <div className="flex justify-center w-full p-4 bg-gradient-to-r from-indigo-800 to-indigo-900">
            <div className={`flex flex-col w-full p-8 5xl:px-0 max-w-4xl`}>
                {props.children}
            </div>
        </div>
    )
}