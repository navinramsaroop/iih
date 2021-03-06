import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image
} from "react-native";
import Modal from "react-native-modal";
import DoseCard from "../components/Card/DoseCard";
import { pullMedicineFromDatabase } from "../databaseUtil/databaseUtil";
import Moment from "moment";
import { asyncCreateMedicineEvents } from "../databaseUtil/databaseUtil";
import DropdownAlert from "react-native-dropdownalert";
import { COLOR, IMAGES } from "../resources/constants";
import { shouldBeTaken, shouldBeTakenNow } from "../resources/helpers";
import MedicineAddForm from "../components/MedicineAddForm/MedicineAddForm.js";
import { setMassNotification } from "../components/PushController/PushController.js";

class MedicineView extends React.Component {
  static propTypes = {
    onPress: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      passed_index: 0,
      toggle_add: false
    };
  }

  /**
   * asyncDatabasePull populates [state.data] with medication data for the current day
   */
  asyncDatabasePull = () => {
    let that = this;
    pullMedicineFromDatabase(new Date(), function(formattedData) {
      var medicineData = [];
      Object.keys(formattedData).forEach(function(med) {
        var medObj = formattedData[med];
        var formattedTimes = medObj.time.map(
          t => Moment().format("MMMM DD YYYY") + " " + t
        );
        medicineData.push({
          title: med,
          time: formattedTimes,
          timeVal: medObj.time,
          dosage: medObj.dosage,
          statuses: medObj.taken,
          takenTime: medObj.takenTime
        });
      });
      that.setState({
        data: medicineData
      });
    });
  };

  /**
   * error dropdown if user fails to complete the medicine add form and presses submit
   */
  errorOnSubmit() {
    this.dropdown.close();
    this.dropdown.alertWithType(
      "custom",
      "Form Incomplete",
      "Please add any missing information"
    );
  }

  /**
   * success dropdown if users succesfully submits the medicine add form
   */
  successOnSubmit() {
    this.dropdown_success.close();
    this.dropdown_success.alertWithType("custom", "New Medicine Added!", "");
  }

  /**
   * asyncDatabaseUpdate takes data for a new medication and writes to the database:
   * title (String): medicine name
   * dosage (String): dosage amount in mg
   * start (Moment date object): when to begin logging
   * end (Moment date object): when to stop logging
   * time (String array): array of times to start-> writes to the database
   * time_category (Integer): {1,2,3,4} correspond to morning, afternoon, evening, and night respectively
   */
  asyncDatabaseUpdate = (title, dosage, start, end, time, time_category) => {
      asyncCreateMedicineEvents(title, dosage, start, end, time, time_category);
      new_title = "Fiih Medication Reminder";
      new_body = "It's time to take " + title +"! (" + dosage + ")";
      setMassNotification(start, end, new_title, new_body, time, () => {console.log("created reminders")});
    endNew = Moment(end);
    endNew.date(endNew.date() + 1);
    if (Moment().isBetween(start, endNew)) {
      medicineData = this.state.data;
      for (var i = 0; i < medicineData.length; i++) {
        if (medicineData[i].title == title) {
          medicineData.splice(i, 1);
        }
      }
      var formattedTimes = time.map(
        t => Moment().format("MMMM DD YYYY") + " " + t
      );
      var taken = time.map(t => false);
      var takenTime = time.map(t => "");
      medicineData.push({
        title: title,
        time: formattedTimes,
        timeVal: time,
        dosage: dosage,
        statuses: taken,
        takenTime: takenTime
      });
      this.setState({
        toggle_add: false,
        data: medicineData
      });
    }
  };

  componentDidMount = () => {
    this.asyncDatabasePull();
  };

  // 0 is red, 1 is green, 2 is gray
  // returns tuple of [passed_index, color]
  getPassedIndex = (a) => {
    var passed_index = 0;
    if (a.statuses) {
      for (var x = a.statuses.length - 1; x >= 0; x--) {
        // hit a taken, next one
        if (a.statuses[x]) {
          passed_index = x + 1;
          break;
        }
        // first red we see (latest red)
        if (
          a.statuses[x] == false &&
          shouldBeTaken(new Date(a.time[x]), new Date()) &&
          !shouldBeTakenNow(new Date(a.time[x]))
        ) {
          return [x, 0];
        }
        // if no taken or red, means we havent missed any and have taken some
      }
    }else{
      passed_index = 0;
    }
    if (shouldBeTakenNow(new Date(a.time[passed_index]))){
      return [passed_index, 1]
    }else{
      return [passed_index, 2]
    }
  }

  /**
   * custom sorting algorithm for medicine cards on the medicine view flatlist:
   * [Red] Missed Medications
   * [Green] Take Now Medications
   * [Grey] Complete/Future Medications
   * sorted in ascending time order within each category
   */
  compareCards = (a,b) => {
    var passed_a = (this.getPassedIndex(a))[0]
    var color_a  = (this.getPassedIndex(a))[1]
    var passed_b = (this.getPassedIndex(b))[0]
    var color_b  = (this.getPassedIndex(b))[1]

    if (color_a != color_b){
      return color_a > color_b
    }else {
      // Done for the Day must be last
      if (passed_a == a.statuses.length){
        return 1
      // Compare times if same color
      }else{
        return (a.time[passed_a] > b.time[passed_b])
      }
    }
  }

  /**
   * returns DoseCard component populated with appropriate medicine data
   */
  _renderCard = ({ item }) => {
    return (
      <View>
        <DoseCard
          title={item.title}
          time={item.time}
          key={item.title}
          takenTime={item.takenTime}
          dosage={item.dosage}
          passed={item.statuses}
          imageData={this.updateData}
          buttonsRight={[
            {
              text: "Edit",
              type: "edit",
              onPress: () => {
                this.setState({
                  modalVisible: true
                });
              }
            }
          ]}
        />
      </View>
    );
  };

  render() {
    const { navigate } = this.props.navigation;
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    currentDate = new Date();
    currentMonths = monthNames[currentDate.getMonth()];
    currentYear = currentDate.getYear();
    currentDay = currentDate.getDay();
    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Today</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.date}>{Moment().format("MMMM DD, YYYY")}</Text>
          <TouchableOpacity
            style={{ padding: 15 }}
            onPress={() => {
              this.setState({
                toggle_add: true
              });
            }}
          >
            <Image
              style={{ height: 50, width: 50 }}
              source={require("../resources/images/plusSignMinimal.png")}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity />
        <FlatList
          data={this.state.data.sort(this.compareCards)}
          extraData={this.state}
          renderItem={this._renderCard}
          keyExtractor={(item, _) => item.title}
        />
        <Modal
          isVisible={this.state.toggle_add}
          style={styles.addFormWrapper}
          animationIn={"slideInRight"}
          animationOut={"slideOutRight"}
          backdropOpacity={1}
        >
          <MedicineAddForm
            exitModal={() => {
              this.setState({ toggle_add: false });
            }}
            asyncDatabaseUpdate={(
              title,
              dosage,
              start,
              end,
              time,
              time_category
            ) => {
              this.asyncDatabaseUpdate(
                title,
                dosage,
                start,
                end,
                time,
                time_category
              );
            }}
            errorOnSubmit={() => {
              this.errorOnSubmit();
            }}
            successOnSubmit={() => {
              this.successOnSubmit();
            }}
          />
        </Modal>
        <DropdownAlert
          ref={ref => (this.dropdown = ref)}
          closeInterval={2000}
          imageSrc={IMAGES.close_white}
          containerStyle={{
            backgroundColor: COLOR.red
          }}
        />
        <DropdownAlert
          ref={ref => (this.dropdown_success = ref)}
          closeInterval={2000}
          imageSrc={IMAGES.checkmarkWhite}
          containerStyle={{
            backgroundColor: COLOR.cyan
          }}
        />
        {!this.state.data[0] && (
          <Text style={styles.defaultText}>
            No medicines scheduled for today!
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    flexDirection: "row",
    padding: 15,
    paddingBottom: 0,
    justifyContent: "space-between",
    alignItems: "center"
  },
  titleText: {
    fontSize: 25,
    fontWeight: "700",
    alignItems: "center",
    justifyContent: "center",
    color: "#333333"
  },
  date: {
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: "500",
    color: "#555555"
  },
  separator: {
    fontSize: 30,
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    color: "#555555",
    marginLeft: 5,
    marginRight: 5
  },
  addFormWrapper: {
    flex: 1,
    backgroundColor: "white",
    margin: 0
  },
  defaultText: {
    flex: 1,
    color: "#555555",
    fontSize: 20,
    textAlign: "center",
    justifyContent: "center",
    alignSelf: "center"
  }
});

export default MedicineView;
