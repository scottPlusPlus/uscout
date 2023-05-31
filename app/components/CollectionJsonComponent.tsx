import { Collection } from '@prisma/client';

import React, { lazy, Suspense } from 'react';
import { Item } from '~/models/item.server';
import { assertValidCollection, CollectionJson } from '~/code/datatypes/collectionJson';
import { CSS_CLASSES } from '~/code/front/CssClasses';

export default function CollectionJsonComponent(props: { collection: Collection, items: Item[], onSave:(arg0:CollectionJson)=>void }) {

    const [show, setShow] = React.useState(false);
    const [input, setInput] = React.useState("");
    const [saveErr, setSaveErr] = React.useState(null);

    if (!show) {
        return (
            <div className="flex p-4 ">
                <button
                    className={CSS_CLASSES.SUBMIT_BUTTON}
                    onClick={() => { setShow(true) }}
                >
                    Advanced Controls
                </button>
            </div>
        )
    }

    const collectionJson: CollectionJson = {
        collection: props.collection,
        items: props.items
    }
    const jsonString = JSON.stringify(collectionJson, null, 2); // pretty-print with 2 spaces



    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        setSaveErr(null);
    };

    const handleSaveClick = () => {
        var validCollection = null;
        try {
            const parsed:CollectionJson = JSON.parse(input);
            validCollection = assertValidCollection(parsed);
            console.log("success");
            props.onSave(validCollection);
            setInput("");
        } catch (err:any){
            setSaveErr(err.message);
        }
    };

    return (
        <div>
            <div className="flex p-4 align-middle gap-4">
                <button
                    className={CSS_CLASSES.CANCEL_BUTTON}
                    onClick={() => { setShow(false) }}
                >
                    Hide
                </button>
                <h3 className={CSS_CLASSES.LABEL}>Advanced Controls</h3>
            </div>
            <div className="flex flex-col md:flex-row p-4 gap-4">

                <div className="flex-1">
                    <p>Current Collection JSON</p>
                    <div className="h-48 overflow-y-scroll border">
                        <pre className="whitespace-pre-wrap">{jsonString}</pre>
                    </div>
                </div>
                <div className="flex-1">
                    <p>Paste some JSON here to override the collection</p>
                    <textarea
                        className="w-full h-48 p-2 border rounded"
                        placeholder="Paste some text here"
                        value={input}
                        onChange={handleTextChange}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={saveErr !== null}
                        onClick={handleSaveClick}
                    >
                        Save
                    </button>
                    {saveErr && (
                        <p className={CSS_CLASSES.ERROR_CLASS}>{saveErr}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
