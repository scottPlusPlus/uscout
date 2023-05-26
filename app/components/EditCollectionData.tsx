import React, { useState } from 'react';
import type { Collection } from "@prisma/client";
import { CSS_CLASSES } from '~/code/front/CssClasses';
import { ADD_ITEM_SETTING, collectionSettings } from '~/code/datatypes/collectionSettings';

interface EditCollectionProps {
  collection: Collection;
  onSubmit: (arg0: Collection) => void;
}

function addItemValue(addItemSetting: string): string {
  console.log("get value for: " + addItemSetting);
  switch (addItemSetting) {
    case ADD_ITEM_SETTING.ADMINS:
      return "Admins Only";
    case ADD_ITEM_SETTING.OPEN:
      return "Guests";
    case ADD_ITEM_SETTING.OPEN_SUGGEST:
      return "Guests as Pending";
    default:
      return "??";
  }
}

export default function EditCollectionData(props: EditCollectionProps) {

  const settings = collectionSettings(props.collection);
  const addItemOptions = [ADD_ITEM_SETTING.ADMINS, ADD_ITEM_SETTING.OPEN, ADD_ITEM_SETTING.OPEN_SUGGEST];
  const [newTitle, setNewTitle] = useState(props.collection.title);
  const [newDescription, setNewDescription] = useState(props.collection.description);
  const [newAddSetting, setNewAddSetting] = useState(settings.addItemSettings);

  const handleSubmit = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newCollection = { ...props.collection };
    newCollection.title = newTitle;
    newCollection.description = newDescription;
    const newSettings = { ...settings };
    newSettings.addItemSettings = newAddSetting;
    newCollection.settings = JSON.stringify(newSettings);
    props.onSubmit(newCollection);
  };

  const handleCancel = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setNewTitle(props.collection.title);
    setNewDescription(props.collection.description);
    setNewAddSetting(settings.addItemSettings);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
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
        <label>
          Who Can Add Items?:
        </label>
        <br />
        <select onChange={(event) => setNewAddSetting(event.target.value)} value={newAddSetting}>
          {addItemOptions.map((option) => (
            <option key={option} value={option}>
              {addItemValue(option)}
            </option>
          ))}
        </select>

        <br /><br />
        <button type="submit" className={CSS_CLASSES.SUBMIT_BUTTON} onClick={handleSubmit}>Save</button>
        <button type="reset" className={CSS_CLASSES.CANCEL_BUTTON} onClick={handleCancel}>Reset</button>
      </form>
    </div>
  );
};


