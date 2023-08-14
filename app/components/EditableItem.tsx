import { useState } from "react";
import { CSS_CLASSES } from "~/code/front/CssClasses";
import { ItemFront } from "~/models/item.server";
import { ScrapedInfo } from "~/code/datatypes/info";

type EditItemProps = {
  item: ItemFront,
  info: ScrapedInfo,
  onSave: (arg0: ItemFront) => void,
  onDelete: (arg0: ItemFront) => void,
}


export default function EditableItem(props: EditItemProps) {

  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(props.item);
  const [deleted, setDeleted] = useState(false);

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
    if (!deleted){
      editedItem.tags = editedItem.tags.sort();
      console.log(editedItem);
      props.onSave(editedItem);
    } else {
      props.onDelete(editedItem)
    }
    setEditMode(false);
  };

  const handleDiscard = () => {
    setEditedItem(props.item);
    setDeleted(false);
    setEditMode(false);
  };

  const handleDelete = () => {
    setDeleted(true);
  };



  function bodySection() {

    if (!editMode) {
      return (null);
    }

    if (deleted) {
      return (
        <div>
          <p>Save Item to commit deletion</p>
        </div>
      )
    }

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
      </div>
    );
  }


  function footerControls() {
    if (!editMode) {
      return (
        <div className="flex justify-end">
          <button className={CSS_CLASSES.SUBMIT_BUTTON} onClick={() => setEditMode(true)}>Edit</button>
        </div>
      )
    }
    return (
      <div className="flex justify-between">
        <button
          className={`${CSS_CLASSES.SUBMIT_BUTTON} mr-auto`}
          disabled={deleted}
          onClick={handleDelete}
        >
          Delete
        </button>
        <div>
          <button
            className={`${CSS_CLASSES.SUBMIT_BUTTON} ml-2`}
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className={`${CSS_CLASSES.CANCEL_BUTTON} ml-2`}
            onClick={handleDiscard}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  ``
  return (

    <div className="bg-gray-100 p-4 rounded-md shadow-md">
      {bodySection()}


      {footerControls()}
    </div >
  );
}