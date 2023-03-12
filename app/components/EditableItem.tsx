import { UInfo } from "@prisma/client";
import { useState } from "react";
import { CSS_CLASSES } from "~/code/CssClasses";
import { Item, ItemFront } from "~/models/item.server";
import Image3x2 from "./Image3x2";

export default function EditableItem(props: { item: ItemFront, info:UInfo, onSave:(arg0: ItemFront)=>void }) {

  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(props.item);

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    var { name, value } = event.target;
    if (name == "tags") {
      value = value.split(", ").map((v: string) => { return v.trim() });
    }
    if (name == "priority") {
      value = parseInt(value) || 0;
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

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md">
      <div className="mb-4">
        <a className="font-bold text-blue-700 mb-2" href={props.info.fullUrl}>{editedItem.url}</a>
        <Image3x2 src={props.info.image} />
      </div>
      <div className="mb-4">
        <label
          className={CSS_CLASSES.LABEL}
          htmlFor="comment"
        >
          Comment
        </label>
        {editMode ? (
          <input
            className={CSS_CLASSES.INPUT_FIELD}
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
        <label className={CSS_CLASSES.LABEL} htmlFor="tags">
          Tags
        </label>
        {editMode ? (
          <input
            className={CSS_CLASSES.INPUT_FIELD}
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
          className={CSS_CLASSES.LABEL}
          htmlFor="priority"
        >
          Priority
        </label>
        {editMode ? (
          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="number"
            name="priority"
            value={editedItem.priority}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-gray-700">{editedItem.priority}</p>
        )}
      </div>
      <div className="mb-4">
        <label className={CSS_CLASSES.LABEL} htmlFor="status">
          Status
        </label>
        {editMode ? (
          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="text"
            name="status"
            value={editedItem.status}
            onChange={handleInputChange}
          />
        ) : (
          <p className="text-gray-700">{editedItem.status}</p>
        )}
      </div>

      <div className="flex justify-end">
        {editMode ? (
          <>
            <button
              className={CSS_CLASSES.SUBMIT_BUTTON}
              onClick={handleSave}>Save</button>
            <button className={CSS_CLASSES.SUBMIT_BUTTON} onClick={handleDiscard}>Discard</button>
          </>
        ) : (
          <button className={CSS_CLASSES.SUBMIT_BUTTON} onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>
    </div>
  );
}