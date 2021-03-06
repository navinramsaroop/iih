import { MailComposer, FileSystem } from "expo";
import { exportAllSymptoms } from "../databaseUtil/databaseUtil";
import { SYMPTOM_FIELDS } from "../resources/constants.js";
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;
  var DEFAULT_VALUE = "N/A";
  console.log(args.data);

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ",";
  lineDelimiter = args.lineDelimiter || "\n";

  keys = args.keys ? args.keys : Object.keys(data[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    ctr = 0;
    //  console.log("item", item);
    keys.forEach(function(key) {
      //  console.log("key", key);
      if (ctr > 0) result += columnDelimiter;

      result += item[key] ? item[key] : DEFAULT_VALUE;
      ctr++;
    });
    result += lineDelimiter;
  });
  //console.log('result of func conversion: ' + result);
  return result;
}

/*
  Opens a mail modal with the given email and subject, and with the attachment of
  a csv file with all the symptoms.
*/
export function exportDataMailFunc(email, subject) {
  console.log("entered export data mail func.");
  SURVEY_DIR = FileSystem.documentDirectory + "doctordata";
  FILE_NAME = "history.csv";
  SHARED_KEYS = ["symptom", "timestamp"]; //all symptoms have these keys

  //use database function to get an array of objects representing the data
  exportAllSymptoms(symptoms => {
    console.log("successfully retrieved symptoms from database.");
    FileSystem.getInfoAsync(SURVEY_DIR, {})
      .then(e => {
        if (!e.exists || !e.isDirectory) {
          console.log("making dir");
          return FileSystem.makeDirectoryAsync(SURVEY_DIR);
        }
      })
      .then(() => {
        content = "";
        content = convertArrayOfObjectsToCSV({
          data: symptoms,
          keys: SHARED_KEYS.concat(SYMPTOM_FIELDS) //headers for csv file
        });
        console.log("converted array of objects to csv.");
        console.log("writing: " + content);
        return FileSystem.writeAsStringAsync(
          SURVEY_DIR + "/" + FILE_NAME,
          content
        );
      })
      .then(e => {
        MailComposer.composeAsync({
          recipients: [email],
          subject: subject,
          body: "",
          attachments: [SURVEY_DIR + "/" + FILE_NAME]
        });
      })
      .catch(e => console.log(e));
  });
}
