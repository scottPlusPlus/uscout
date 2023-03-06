import { Collection } from '@prisma/client';

import React, { lazy, Suspense } from 'react';
const ReactMarkdown = lazy(() => import('react-markdown'));

export default function CollectionDataDisplay(props: { collection: Collection }) {
    return (
        <div className="max-w-lg mx-auto px-4 py-4">
            <h3 className="text-4xl font-bold mb-4">{props.collection.title}</h3>
            <div className="prose lg:prose-xl text-gray-600">
                <ReactMarkdown
                    components={{
                        a: ({ children, href }) => (
                            <a href={href} className="text-blue-500">
                                {children}
                            </a>
                        ),
                    }}
                >
                    {props.collection.description}
                </ReactMarkdown>
            </div>
        </div>
    )
}
