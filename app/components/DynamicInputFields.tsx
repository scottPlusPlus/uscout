import React, { useState } from "react";

type SearchTerm = {
  term: string,
  priority: number
}
type HandleChangeFunction = (terms: SearchTerm[]) => void;

export default function DynamicInputFields(props: { searchTerms: SearchTerm[], onChange: HandleChangeFunction }) {

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const terms = [...props.searchTerms];
    if (name === "field1") {
      terms[index].term = event.target.value;
    } else {
      terms[index].priority = parseFloat(event.target.value);
    }
    props.onChange(terms);
  };

  const handleAddFields = () => {
    const terms = [...props.searchTerms];
    terms.push({ term: "", priority: 100 });
    props.onChange(terms);
  };

  const handleRemoveFields = (index: number) => {
    const terms = [...props.searchTerms];
    terms.splice(index, 1);
    props.onChange(terms);
  };

  return (
    <div className="bg-gray-100">
      <div className="flex">
        <div className="flex-none p-4">
          Search:
        </div>
        <div className="flex-1 p-4">
          {props.searchTerms.map((term, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Search Term"
                name="field1"
                value={term.term}
                onChange={(event) => handleInputChange(index, event)}
                className="px-2 py-1 border rounded-md mr-2"
              />
              <input
                type="number"
                placeholder="Enter Field 2"
                name="field2"
                value={term.priority}
                onChange={(event) => handleInputChange(index, event)}
                className="w-24 px-2 py-1 border rounded-md mr-2"
              />
              {index > 0 && (
                <button type="button" onClick={() => handleRemoveFields(index)} className="px-2 py-1 rounded-md bg-red-500 text-white">
                  -
                </button>
              )}
              {index == props.searchTerms.length - 1 && (
                <button type="button" onClick={() => handleAddFields()} className="px-2 py-1 rounded-md bg-green-500 text-white">
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};