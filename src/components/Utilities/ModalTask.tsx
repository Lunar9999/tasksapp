import React, { useRef, useState } from "react";
import { Task } from "../../interfaces";
import { useAppSelector } from "../../store/hooks";
import Modal from "./Modal";

const InputCheckbox: React.FC<{
  label: string;
  isChecked: boolean;
  setChecked: (value: React.SetStateAction<boolean>) => void;
}> = ({ isChecked, setChecked, label }) => {
  return (
    <label className="mb-0 flex items-center cursor-pointer">
      <div className="mr-2 bg-slate-300/[.5] dark:bg-slate-800 w-5 h-5 rounded-full grid place-items-center border border-slate-300 dark:border-slate-700">
        {isChecked && <span className="bg-rose-500 w-2 h-2 block rounded-full"></span>}
      </div>
      <span className="order-1 flex-1">{label}</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={() => setChecked((prev: boolean) => !prev)}
      />
    </label>
  );
};

const ModalCreateTask: React.FC<{
  onClose: () => void;
  task?: Task;
  nameForm: string;
  onConfirm: (task: Task) => void;
}> = ({ onClose, task, nameForm, onConfirm }) => {
  const directories = useAppSelector((state) => state.tasks.directories);

  const today = new Date().toLocaleDateString("en-CA"); // Ensures YYYY-MM-DD format
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const maxDate = nextYear.toLocaleDateString("en-CA");

  const [description, setDescription] = useState(task?.description || "");
  const [title, setTitle] = useState(task?.title || "");
  const [date, setDate] = useState(task?.date?.split("T")[0] || today); // Removes the 'T' if present
  const [isImportant, setIsImportant] = useState(task?.important || false);
  const [isCompleted, setIsCompleted] = useState(task?.completed || false);
  const [selectedDirectory, setSelectedDirectory] = useState(task?.dir || directories[0]);

  const isTitleValid = useRef(false);
  const isDateValid = useRef(false);

  const addNewTaskHandler = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
  
    isTitleValid.current = title.trim().length > 0;
    isDateValid.current = date.trim().length > 0;
  
    if (isTitleValid.current && isDateValid.current) {
      const isoDate = new Date(date).toISOString().split("T")[0];
      const newTask: Task = {
        title: title || "Untitled Task",
        dir: selectedDirectory,
        description: description || "No description provided",
        date: isoDate,
        completed: isCompleted,
        important: isImportant,
        id: task?.id || Date.now().toString(),
        userid: task?.id || Date.now().toString(),
      };
      console.log("Task being sent:", newTask);
      await onConfirm(newTask);
      onClose();
    } else {
      console.warn("Invalid task submission: Title or Date is missing");
    }
  };

  return (
    <Modal onClose={onClose} title={nameForm}>
      <form className="flex flex-col stylesInputsField" onSubmit={addNewTaskHandler}>
        <label>
          Title
          <input
            type="text"
            placeholder="e.g., Study for the test"
            required
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            className="w-full"
          />
        </label>
        <label>
          Date
          <input
            type="date"
            className="w-full"
            value={date}
            required
            onChange={({ target }) => setDate(target.value)}
            min={today}
            max={maxDate}
          />
        </label>
        <label>
          Description (optional)
          <textarea
            placeholder="e.g., Study for the test"
            className="w-full"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
          ></textarea>
        </label>
        <label>
          Select a directory
          <select
            className="block w-full"
            value={selectedDirectory}
            onChange={({ target }) => setSelectedDirectory(target.value)}
          >
            {directories.map((dir: string) => (
              <option key={dir} value={dir} className="bg-slate-100 dark:bg-slate-800">
                {dir}
              </option>
            ))}
          </select>
        </label>
        <InputCheckbox isChecked={isImportant} setChecked={setIsImportant} label="Mark as important" />
        <InputCheckbox isChecked={isCompleted} setChecked={setIsCompleted} label="Mark as completed" />
        <button type="submit" className="btn mt-5">{nameForm}</button>
      </form>
    </Modal>
  );
};

export default ModalCreateTask;
