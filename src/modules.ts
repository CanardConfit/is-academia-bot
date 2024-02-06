import { format } from "date-fns";
import * as fs from "fs";
import * as cheerio from "cheerio";
import { env } from "./env";
import { logger } from "./logger";

export interface Difference {
  module: Module;
  course: Course;
  oldNote?: Note;
  newNote?: Note;
}

/* eslint-disable */
export const parseJsonToModules = (jsonString: string): Module[] => {
  try {
    const data: any[] = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      throw new Error("The JSON does not represent an array.");
    }

    return data.map((moduleData) => {
      if (
        typeof moduleData.id !== "string" ||
        typeof moduleData.title !== "string"
      ) {
        throw new Error(
          '"id" and "title" properties must be strings.',
        );
      }

      const module = new Module(moduleData.id, moduleData.title);

      if (Array.isArray(moduleData.courses)) {
        moduleData.courses.forEach((courseData: any) => {
          if (
            typeof courseData.id !== "string" ||
            typeof courseData.title !== "string"
          ) {
            throw new Error(
              '"id" and "title" properties of courses must be strings.',
            );
          }

          const course = new Course(courseData.id, courseData.title, [], []);

          if (Array.isArray(courseData.notes)) {
            courseData.notes.forEach((noteData: any) => {
              if (
                typeof noteData.title !== "string" ||
                typeof noteData.date !== "string" ||
                typeof noteData.coefficient !== "number" ||
                typeof noteData.note !== "number"
              ) {
                throw new Error(
                  "Properties of notes must conform to the model.",
                );
              }

              const note = new Note(
                noteData.title,
                new Date(noteData.date),
                noteData.coefficient,
                noteData.note,
              );
              course.notes.push(note);
            });
          }

          module.courses.push(course);
        });
      }

      return module;
    });
  } catch (error: any) {
    logger.error(`Error converting JSON to Module[]: ${error.message}`);
    return [];
  }
};
/* eslint-enable */

export const findDifferences = (
  oldModules: Module[],
  newModules: Module[],
): Difference[] => {
  const differences: Difference[] = [];

  oldModules.forEach((oldModule) => {
    const newModule = newModules.find((module) => module.id === oldModule.id);

    if (newModule) {
      oldModule.courses.forEach((oldCourse) => {
        const newCourse = newModule.courses.find(
          (course) => course.id === oldCourse.id,
        );

        if (newCourse) {
          oldCourse.notes.forEach((oldNote) => {
            const newNote = newCourse.notes.find(
              (note) => note.title === oldNote.title,
            );

            if (newNote && oldNote.note !== newNote.note) {
              differences.push({
                module: oldModule,
                course: oldCourse,
                oldNote: oldNote,
                newNote: oldNote,
              });
            }
          });

          newCourse.notes.forEach((newNote) => {
            const oldNote = oldCourse.notes.find(
              (note) => note.title === newNote.title,
            );

            if (!oldNote) {
              differences.push({
                module: oldModule,
                course: oldCourse,
                oldNote: oldNote,
                newNote: newNote,
              });
            }
          });

          oldCourse.notes.forEach((oldNote) => {
            const newNote = newCourse.notes.find(
              (note) => note.title === oldNote.title,
            );

            if (!newNote) {
              differences.push({
                module: oldModule,
                course: oldCourse,
                oldNote: oldNote,
                newNote: newNote,
              });
            }
          });
        }
      });
    }
  });

  return differences;
};

/* eslint-disable */
function parseModulesFromFile(filePath: string): Module[] {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const parsedData: any[] = JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      throw new Error("File content is not a JSON array.");
    }

    const modules: Module[] = parsedData.map((data: any) => {
      if (typeof data.id !== "string" || typeof data.title !== "string") {
        throw new Error('"id" and "title" properties must be strings.');
      }

      return new Module(data.id, data.title);
    });

    return modules;
  } catch (error: any) {
    logger.error(`Error reading and parsing the file: ${error.message}`);
    return [];
  }
}

export const parse = (html: string): Module[] => {
  const $ = cheerio.load(html);
  const courses: Course[] = [];

  $("thead").each((theadIndex, thead) => {
    const tbody = $("tbody").eq(theadIndex);
    const id = $(thead).find("th.cc-inscr-matiere").text().split("-")[0].trim();
    const title = $(thead).find("th.cc-inscr-matiere").text().split("-")[1].trim();
    const professors = $(thead)
      .find("th.cc-inscr-enseignants")
      .text()
      .split(", ");

    const notes: Note[] = [];
    const noteCells = $(thead).find("th.cc-inscr-titre");

    noteCells.each((index, noteCell) => {
      const noteTitle = $(noteCell).text().trim();
      const note = $(tbody).find("td.cc-inscr-note").eq(index);
      const noteValue = parseFloat(note.text().trim() || "0");

      const dateCell = $(thead).find("th.cc-inscr-date").eq(index);
      const date = dateCell.text().trim();
      const dateParts = date.split(".");

      const coefficientCell = $(thead).find("th.cc-inscr-coeff").eq(index);
      const coefficient = parseFloat(coefficientCell.text().trim() || "0");

      notes.push(new Note(
        noteTitle,
        new Date(parseInt(dateParts[2], 10),
          parseInt(dateParts[1], 10) - 1,
          parseInt(dateParts[0], 10)),
        coefficient,
        noteValue,
      ));
    });

    courses.push(new Course(id, title, professors, notes));
  });

  const modules: Module[] = parseModulesFromFile(env.MODULES_FILE);

  courses.forEach((course) => {
    modules.forEach((module) => {
      if (course.id.startsWith(module.id)) {
        module.addCourse(course);
      }
    });
  });

  return modules;
};
/* eslint-enable */

export class Note {
  title: string;
  date: Date;
  coefficient: number;
  note: number;

  constructor(title: string, date: Date, coefficient: number, note: number) {
    this.title = title;
    this.date = date;
    this.coefficient = coefficient;
    this.note = note;
  }

  toString(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return `${this.title} | ${format(this.date, "dd-MM-yyyy")} | ${this.coefficient} | ${this.note}`;
  }
}

export class Course {
  id: string;
  title: string;
  professors: string[];
  notes: Note[];

  constructor(id: string, title: string, professors: string[], notes: Note[]) {
    this.id = id;
    this.title = title;
    this.professors = professors;
    this.notes = notes;
  }

  average(): number {
    let coefficient = 0;
    let sum = 0;

    this.notes.forEach((note) => {
      if (note.note != 0) {
        sum += note.note * note.coefficient;
        coefficient += note.coefficient;
      }
    });

    let average = parseFloat(
      (Math.round((sum / coefficient) * 10) / 10).toFixed(1),
    );

    if (isNaN(average)) average = 0;

    return average;
  }

  toString(): string {
    return `\n## ${this.id} - ${this.title}\n\nTitle|Date|Coefficient|Note\n-|-|-|-\n${this.notes.map<string>((note) => note.toString()).join("\n")}\nAverage|||${this.average()}`;
  }
}

export class Module {
  id: string;
  title: string;
  courses: Course[] = [];

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  addCourse(course: Course): void {
    this.courses.push(course);
  }

  average(): number {
    let num = 0;
    let sum = 0;

    this.courses.forEach((cours) => {
      const average = cours.average();
      if (average != 0) {
        sum += average;
        num += 1;
      }
    });

    return parseFloat((sum / num).toFixed(1));
  }

  toString(): string {
    return `# ${this.id} - ${this.title}\n${this.courses.map<string>((course) => course.toString()).join("\n")}\n\nAverage Module: ${this.average()}`;
  }
}
