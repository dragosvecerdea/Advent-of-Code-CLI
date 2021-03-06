import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import api from '../utils/api.js';
import scrapers from '../utils/scrapers.js';

const { fetchDayInput, fetchDayStatement } = api;
const { parsePuzzleStatement } = scrapers;

const getTemplateWithLanguage = (files, language) => {
  return files.map((file) => {
    return file.isTask
      ? {
          ...file,
          extension: language,
        }
      : file;
  });
};

const loadPuzzleInput = async (pathToFile, day) => {
  await fetchDayInput(day)
    .then(({ data: dayInput }) => {
      fs.writeFileSync(pathToFile, dayInput);
      return `Fetched puzzle input for day ${day} succesfully`;
    })
    .catch((err) => `Fetching input for the puzzle unsuccessful. ${err}`)
    .then(console.log);
};

const loadPuzzleStatement = async (pathToFile, day) => {
  await fetchDayStatement(day)
    .then(({ data: rawStatement }) => parsePuzzleStatement(rawStatement))
    .then((statement) => {
      fs.writeFileSync(pathToFile, statement);
      return `Fetched puzzle statement for day ${day} succesfully`;
    })
    .catch((err) => `Fetching statement for the puzzle unsuccessful. ${err}`)
    .then(console.log);
};

const createFilesFromTemplate = (pathToFiles, template, day, taskLanguage = 'py') => {
  getTemplateWithLanguage(template, taskLanguage).forEach(
    ({ name, extension, isInput, isStatement }) => {
      const pathToFile = path.resolve(pathToFiles, [name, extension].join('.'));
      fs.openSync(pathToFile, 'w');
      isInput ? loadPuzzleInput(pathToFile, day) : null;
      isStatement ? loadPuzzleStatement(pathToFile, day) : null;
    }
  );
};

const createDirFromTemplate = async (pathToDir, template, day, taskLanguage) => {
  const pathToFiles = path.join(pathToDir, `day${day}`);
  fs.existsSync(pathToFiles) || fs.mkdirSync(pathToFiles);
  createFilesFromTemplate(pathToFiles, template, day, taskLanguage);
};

const init = async (pathToWorkspace, template, day = 0, language = 'py') => {
  const days = day !== 0 ? [day] : _.range(1, 26);

  return Promise.all(
    days.map((currentDay) => createDirFromTemplate(pathToWorkspace, template, currentDay, language))
  )
    .then(() => 'Workspace created successfully')
    .catch((err) => `Creating workspace failed. ${err}`)
    .then(console.log);
};

export default init;
