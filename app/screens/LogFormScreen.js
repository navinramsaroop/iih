import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions
} from "react-native";
import ScaleSlideInputType from "../components/LogInputTypes/ScaleSlideInputType";
import ListInputType from "../components/LogInputTypes/ListInputType";
import NumericalPickerInputType from "../components/LogInputTypes/NumericalPickerInputType";
import Duration from "../components/LogInputTypes/Duration";
import ChecklistInputType from "../components/LogInputTypes/ChecklistInputType";
import DatePicker from "../components/LogInputTypes/DatePicker";
import TimePicker from "../components/LogInputTypes/TimePicker";
import Database from "../Database";
import {
  asyncCreateMedicineEvents,
  asyncCreateSymptomLogEvent
} from "../databaseUtil/databaseUtil";
import moment from "moment";
import { COLOR } from "../resources/constants.js";
import Form from "../components/LogInputTypes/Form";
import NavigationHeader from "../components/NavigationHeader/NavigationHeader";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

event_id_count = 30000;
event_details_id_count = 30000;
keyStart = 200;

export default class ChooseLogScreen extends React.Component {
  constructor(props) {
    super(props);
    var log_name = "";
    var log_type = 0;
    var nav = true;
    var timestamp = "1950-01-01 00:00:00";
    if (this.props.log_type) {
      log_type = this.props.log_type;
      log_name = this.props.log_name;
      nav = false;
      if (this.props.timestamp) {
        timestamp = this.props.timestamp;
      }
    } else {
      log_type = this.props.navigation.state.params.log_type;
      log_name = this.props.navigation.state.params.log_name;
    }

    var keysArray = [];
    var inputArray = [timestamp, log_type];
    Database.transaction(
      tx =>
        tx.executeSql(
          "SELECT fields FROM event_tbl \
          INNER JOIN event_details_tbl on event_tbl.event_details_id = event_details_tbl.event_details_id \
          WHERE timestamp = ? \
          AND event_type_id = ?;",
          inputArray,
          (tx, { rows }) => {
            json_rows = JSON.parse(rows._array[0].fields);
            keysArray = Object.keys(json_rows);

            var valArray = [];
            var submit_vals = {}
            for (let i = 0; i < keysArray.length; i++) {
              var input_types = [];
              valArray[i] = "N/A";
              submit_vals[keysArray[i]] = "N/A"
              Database.transaction(
                tx =>
                  tx.executeSql(
                    "SELECT view_name FROM field_to_view_tbl \
                    WHERE field_name = ?;",
                    [keysArray[i]],
                    (tx, { rows }) => {
                      input_types[i] = rows._array[0].view_name;
                      this.setState({
                        input_type_array: input_types,
                        value_labels: keysArray,
                        values: valArray,
                        submit_vals: submit_vals,
                        event_type_id: log_type,
                        log_name: log_name
                      });
                    }
                  ),
                err => console.log(err)
              );
            }
          }
        ),
      err => console.log(err)
    );

    var input_types = [];

    this.state = {
      input_type_array: input_types,
      nav: nav
    };
  }

  valueChange(label, value) {
    let submit = this.state.submit_vals;
    submit[label] = value;
    this.setState({ submit_vals: submit }, () => {});
  }

  submit() {
    console.log(this.state)
    if (this.state.nav) {
      // Log new symptoms
      this.props.navigation.state.params.onLog();
      this.props.navigation.pop();
      let event_type_id = this.state.event_type_id;
      let values = JSON.stringify(this.state.submit_vals);

      let timestamp = moment().format("YYYY-MM-DD HH:mm:00");
      event_details_id_count++;
      event_id_count++;
      asyncCreateSymptomLogEvent(event_type_id, values, timestamp)

      this.props.screenProps.successOnSubmit();
      this.props.navigation.navigate("Body", {});
    } else {
      this.props.on_finish();
      if (this.props.timestamp) {
        // Edit symptom log
      } else {
        // Add new medication
        asyncCreateMedicineEvents(
          this.state.submit_vals["Pill Name"],
          this.state.submit_vals["Dosage"],
          new Date(this.state.submit_vals["Start Date"]),
          new Date(this.state.submit_vals["End Date"]),
          this.state.submit_vals["Time"],
          this.state.submit_vals["Time Category"],
          event_id_count,
          event_details_id_count
        );
      }
    }
  }

  render() {
    var SCALE_LABELS = ["", "", "", "", "", "", "", "", "", ""];
    var MEDICATION_SCALE_LABELS = ["Morning", "Afternoon", "Evening"];

    let component_array = this.state.input_type_array.map((prop, key) => {
      if (prop == "ScaleSlideInputType") {
        return (
          <ScaleSlideInputType
            key={""+key}
            label_left={"No Pain"}
            label_right={"Severe"}
            value={parseInt(this.state.values[key]) - 1}
            scale_labels={SCALE_LABELS}
            title_text={this.state.value_labels[key]}
            val_label={this.state.value_labels[key]}
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
            isIntensitySlider={true}
          />
        );
      } else if (prop == "NumericalPickerInputType") {
        return (
          <Duration
            val_label={this.state.value_labels[key]}
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
          />
        );
      } else if (prop == "DosagePickerInputType") {
        return (
          <NumericalPickerInputType
            key={""+key}
            input_style={styles.input_container_blue}
            title_text_style={styles.title_text}
            value={this.state.values[key]}
            min={0}
            max={40}
            inc_scale={10}
            unit={"mg"}
            title_text={this.state.value_labels[key]}
            val_label={this.state.value_labels[key]}
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
          />
        );
      } else if (prop == "TextInputType") {
        return (
          // <TextInputType
          //   key={key}
          //   input_style={styles.input_container_green}
          //   title_text_style={styles.title_text}
          //   text={this.state.values[key]}
          //   placeholder_text={'Type here...'}
          //   title_text={this.state.value_labels[key]}
          //   val_label={this.state.value_labels[key]}
          //   valueChange={this.valueChange.bind(this)}
          // />
          <ListInputType
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
            val_label={this.state.value_labels[key]}
          />
        );
      } else if (prop == "DatePicker") {
        return (
          <DatePicker
            key={""+key}
            input_style={styles.input_container_transparent_green}
            title_text_style={styles.title_text_green}
            value={this.state.values[key]}
            title_text={this.state.value_labels[key]}
            val_label={this.state.value_labels[key]}
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
          />
        );
      } else if (prop == "DayChooserInputType") {
        return (
          <ChecklistInputType
            key={""+key}
            list_values={[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ]}
            input_style={styles.input_container_green}
            title_text_style={styles.title_text}
            title_text={this.state.value_labels[key]}
            val_label={this.state.value_labels[key]}
            value={this.state.values[key]}
            valueChange={(label, value) => {
              this._form.valueChange(label, value);
            }}
          />
        );
      } else if (prop == "TimeCategoryInputType") {
        return (
          <View key={""+key}>
            {this.state.values[key].map((prop, timeKey) => {
              return (
                <TimePicker
                  key={
                    ""+
                    this.state.values.length +
                    timeKey +
                    this.state.values[key][timeKey]
                  }
                  input_style={styles.input_container_transparent_blue}
                  title_text_style={styles.title_text_blue}
                  value={this.state.values[key][timeKey]}
                  title_text={"Reminder Time " + (timeKey + 1)}
                  val_label={this.state.value_labels[key]}
                  chosen_date={this.state.values[key][timeKey]}
                  deletePressed={() => {
                    this.state.values[key].splice(timeKey, 1);
                    this.valueChange(
                      this.state.value_labels[key],
                      this.state.values[key]
                    );
                    this.setState({
                      values: this.state.values
                    });
                  }}
                  valueChange={(label, val) => {
                    this.state.values[key][timeKey] = val;
                    this.valueChange(
                      this.state.value_labels[key],
                      this.state.values[key]
                    );
                  }}
                />
              );
            })}
            <TouchableOpacity
              style={styles.add_button}
              onPress={() => {
                this.state.values[key].push(moment().format("HH:mm"));
                this.setState({
                  values: this.state.values
                });
              }}
            >
              <Text style={styles.submit_text}>Add Another Time</Text>
            </TouchableOpacity>
          </View>
        );
      }
    });
    return (
      <View style={styles.container}>
        <View style={styles.backWrapper}>
          <NavigationHeader
            onPressBack={() => {
              this.props.navigation.goBack();
            }}
            title={this.state.log_name}
          />
        </View>
        <Form
          ref={f => {
            this._form = f;
          }}
          data={component_array}
          valueChange={this.valueChange.bind(this)}
          submit={this.submit.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footerButtonText: {
    fontSize: 20,
    fontWeight: "100",
    textAlign: "center"
  },
  skipButton: {
    height: 75,
    width: 75,
    padding: 15,
    borderRadius: 50,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.19,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 5,
    backgroundColor: "#f9ff5b",
    bottom: 3
  },
  footerButton: {
    height: 78,
    width: viewportWidth,
    padding: 20,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.19,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "transparent",
    position: "absolute",

    borderTopWidth: 1
  },
  overlay: {
    height: 78,
    marginBottom: 0,
    flexDirection: "row",
    position: "absolute",
    backgroundColor: COLOR.lightGreen
  },
  subFooter: {
    flex: 0.1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center"
  },
  footer: {
    flex: 0.2,
    width: viewportWidth,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "white"
  },
  backWrapper: {
    flex: 0.1,
    paddingTop: 25
  },
  headerTitle: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "400",
    color: "black"
  },
  main_container: {
    marginTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title_text: {
    fontSize: 20,
    color: "#e5e5e5",
    paddingBottom: 10
  },
  title_text_green: {
    fontSize: 20,
    color: "#2D8464",
    paddingBottom: 10
  },
  title_text_blue: {
    fontSize: 20,
    color: "#2D6D84",
    paddingBottom: 10
  },
  input_container_blue: {
    width: 320,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#2D6D84",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#2D6D84"
  },
  input_container_green: {
    width: 320,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#2D8464",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#2D8464"
  },
  input_container_transparent_green: {
    width: 320,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#2D8464"
  },
  input_container_transparent_blue: {
    width: 320,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: "#2D6D84"
  },
  submit_button: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: "bottom",
    width: 320,
    alignItems: "center",
    backgroundColor: "#bf5252",
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#bf5252"
  },
  add_button: {
    marginBottom: 20,
    alignItems: "bottom",
    width: 320,
    alignItems: "center",
    backgroundColor: "#bf5252",
    padding: 20,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#bf5252"
  },
  submit_text: {
    color: "white",
    fontSize: 25
  },
  componentWrapper: {
    width: viewportWidth,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  }
});
