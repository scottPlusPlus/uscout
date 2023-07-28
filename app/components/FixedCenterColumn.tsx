import React from 'react';

type Props = {
    children: React.ReactNode,

}

export default function FixedCenterColumn(props: Props) {
    return (
        <div className="flex">
            <div className="flex-grow"></div>
            <div className="w-full max-w-3xl">
                    {props.children}
            </div>
            <div className="flex-grow"></div>
        </div>
    );
}
