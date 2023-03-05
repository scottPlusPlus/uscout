import React, { useState } from "react";

type SearchTerm = {
    term:string,
    priority:number
}
type HandleChangeFunction = (terms:SearchTerm[]) => void;

export default function DynamicInputFields(props:{searchTerms:SearchTerm[], onChange:HandleChangeFunction}) {
    
    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const name = event.target.name;
      const terms = [...props.searchTerms];
      if (name === "field1"){
        terms[index].term = event.target.value;
      } else {
        terms[index].priority =  parseFloat(event.target.value);
      }
      props.onChange(terms);
    };
  
    const handleAddFields = () => {
        const terms = [...props.searchTerms];
        terms.push({term:"", priority:100});
        props.onChange(terms);
    };
  
    const handleRemoveFields = (index: number) => {
        const terms = [...props.searchTerms];
        terms.splice(index, 1);
        props.onChange(terms);
    };
  
    return (
      <div className="p-4 bg-gray-100">
        {props.searchTerms.map((term, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              placeholder="Enter Field 1"
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
              className="px-2 py-1 border rounded-md mr-2"
            />
            {index > 0 && (
              <button type="button" onClick={() => handleRemoveFields(index)} className="px-2 py-1 rounded-md bg-red-500 text-white">
                -
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => handleAddFields()} className="px-2 py-1 rounded-md bg-green-500 text-white">
          +
        </button>
      </div>
    );
  };