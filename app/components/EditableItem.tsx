import { useState } from "react";
import { Item, ItemFront } from "~/models/item.server";

export default function EditableItem(props: { item: ItemFront, onSave:(arg0: ItemFront)=>void }) {

  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(props.item);

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    var { name, value } = event.target;
    if (name == "tags") {
      value = value.split(",").map((v: string) => { return v.trim() });
    }
    setEditedItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log(editedItem);
    setEditMode(false);
    props.onSave(editedItem);
  };

  const handleDiscard = () => {
    setEditedItem(props.item);
    setEditMode(false);
  };

  const buttonClass = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2";
  const inputFieldClass = "border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md">
      <div className="mb-4">
        <a className="font-bold text-blue-700 mb-2" href={editedItem.url}>{editedItem.url}</a>
      </div>
      <div className="mb-4">
        <label
          className="block font-bold text-gray-700 mb-2"
          htmlFor="comment"
        >
          Comment
        </label>
        {editMode ? (
          <input
            className={inputFieldClass}
            type="text"
            name="comment"
            value={editedItem.comment}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-gray-700">{props.item.comment}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-bold text-gray-700 mb-2" htmlFor="tags">
          Tags
        </label>
        {editMode ? (
          <input
            className={inputFieldClass}
            type="text"
            name="tags"
            value={editedItem.tags.join(", ")}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-gray-700">{props.item.tags.join(", ")}</p>
        )}
      </div>
      <div className="mb-4">
        <label
          className="block font-bold text-gray-700 mb-2"
          htmlFor="priority"
        >
          Priority
        </label>
        {editMode ? (
          <input
            className={inputFieldClass}
            type="number"
            name="priority"
            value={editedItem.priority}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-gray-700">{props.item.priority}</p>
        )}
      </div>
      <div className="flex justify-end">
        {editMode ? (
          <>
            <button
              className={buttonClass}
              onClick={handleSave}>Save</button>
            <button className={buttonClass} onClick={handleDiscard}>Discard</button>
          </>
        ) : (
          <button className={buttonClass} onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>
    </div>
  );
}