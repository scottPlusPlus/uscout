import { UInfo } from "@prisma/client";
import { useState } from "react";
import { CSS_CLASSES } from "~/code/CssClasses";
import { Item, ItemFront } from "~/models/item.server";

export default function EditableItem(props: { item: ItemFront, info: UInfo, onSave: (arg0: ItemFront) => void }) {

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

  if (!editMode) {
    return (
      <div className="flex justify-end">
        <button className={CSS_CLASSES.SUBMIT_BUTTON} onClick={() => setEditMode(true)}>Edit</button>
      </div>
    );
  } else {
    return (
      <div>

        <div className="mb-4">
          <label
            className={CSS_CLASSES.LABEL}
            htmlFor="comment"
          >
            Comment
          </label>

          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="text"
            name="comment"
            value={editedItem.comment}
            onChange={handleInputChange}
          />

        </div>
        <div className="mb-4">
          <label className={CSS_CLASSES.LABEL} htmlFor="tags">
            Tags
          </label>
          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="text"
            name="tags"
            value={editedItem.tags.join(", ")}
            onChange={handleInputChange}
          />

        </div>
        <div className="mb-4">
          <label
            className={CSS_CLASSES.LABEL}
            htmlFor="priority"
          >
            Priority
          </label>
          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="number"
            name="priority"
            value={editedItem.priority}
            onChange={handleInputChange}
          />

        </div>
        <div className="mb-4">
          <label className={CSS_CLASSES.LABEL} htmlFor="status">
            Status
          </label>
          <input
            className={CSS_CLASSES.INPUT_FIELD}
            type="text"
            name="status"
            value={editedItem.status}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end">

          <>
            <button
              className={CSS_CLASSES.SUBMIT_BUTTON}
              onClick={handleSave}>Save</button>
            <button className={CSS_CLASSES.CANCEL_BUTTON} onClick={handleDiscard}>Discard</button>
          </>

        </div>
      </div>
    );
  }


}