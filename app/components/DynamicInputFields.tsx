import React, { useState } from "react";

type SearchTerm = {
  term: string,
  priority: number
}
type HandleChangeFunction = (terms: SearchTerm[]) => void;

export const DynamicInputFields = (props: { searchTerms: SearchTerm[], onChange: HandleChangeFunction }) => {

  const localTerms = [...props.searchTerms];
  localTerms.push({ term: "", priority: 100 });

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("DIF: handle input change");
    const name = event.target.name;
    const newTerms = [...props.searchTerms];
    if (index >= newTerms.length) {
      newTerms.push({ term: "", priority: 100 })
    }
    if (name === "field1") {
      newTerms[index].term = event.target.value;
    } else {
      newTerms[index].priority = parseFloat(event.target.value);
    }
    props.onChange(newTerms);
  };

  const handleAddFields = () => {
    //console.log("DIF: add field...");
    // const terms = [...props.searchTerms];
    // terms.push({ term: "", priority: 100 });
    // props.onChange(terms);
  };

  const handleRemoveFields = (index: number) => {
    const terms = [...props.searchTerms];
    // if (localTerms.length > 1){
    terms.splice(index, 1);
    // } else {
    //   terms[0].term = "";
    // }
    props.onChange(terms);
  };

  return (
    <div className="flex">
      <div className="flex-none">
        Search:
      </div>
      <div className="flex-1 px-4">
        {localTerms.map((term, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              placeholder="Search Term"
              name="field1"
              value={term.term}
              onChange={(event) => handleInputChange(index, event)}
              className="px-2 py-1 border rounded-md mr-2"
            />
            {/* <input
                type="number"
                placeholder="Enter Field 2"
                name="field2"
                value={term.priority}
                onChange={(event) => handleInputChange(index, event)}
                className="w-24 px-2 py-1 border rounded-md mr-2"
              /> */}
            {(term.term.length > 0) && (
              <button type="button" onClick={() => handleRemoveFields(index)} className="px-4 py-1 rounded-md bg-red-500 text-white">
                -
              </button>
            )}
            {/* {(index == localTerms.length - 1) && (
                <button type="button" onClick={() => handleAddFields()} className="px-4 py-1 rounded-md bg-green-500 text-white">
                  +
                </button>
              )} */}
          </div>
        ))}
      </div>
    </div>
  );
};