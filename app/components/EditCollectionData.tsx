import React, { useState } from 'react';
import type { Collection } from "@prisma/client";
import { CSS_CLASSES } from '~/code/CssClasses';

interface EditCollectionProps {
  collection: Collection;
  onSubmit: (arg0: Collection) => void;
}

export default function EditCollectionData(props: EditCollectionProps) {

  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState(props.collection.title);
  const [newDescription, setNewDescription] = useState(props.collection.description);

  const handleSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newCollection = { ...props.collection };
    newCollection.title = newTitle;
    newCollection.description = newDescription;
    props.onSubmit(newCollection);
    setEditMode(false);
  };

  const handleCancel = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setNewTitle(props.collection.title);
    setNewDescription(props.collection.description);
    setEditMode(false);
  }

  if (!editMode) {
    return (
      <div className="flex justify-end">
        <button className={CSS_CLASSES.SUBMIT_BUTTON} onClick={() => setEditMode(true)}>Edit</button>
      </div>
    );
  } else {
    return (
      <form>
        <label>
          Title:
          <input
            type="text"
            className={CSS_CLASSES.INPUT_FIELD}
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
        </label>
        <br />
        <label>
          Description:
        </label>
        <br />
        <textarea
          rows={8}
          className={CSS_CLASSES.INPUT_FIELD}
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
        />

        <br />
        <button type="submit" className={CSS_CLASSES.SUBMIT_BUTTON} onClick={handleSubmit}>Save</button>
        <button type="reset" className={CSS_CLASSES.CANCEL_BUTTON} onClick={handleCancel}>Discard</button>
      </form>
    );
  }
};
