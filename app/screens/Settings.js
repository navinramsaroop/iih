import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  View,
  Text,
  Image,
  NavigatorIOS
} from "react-native";
import Modal from "react-native-modal";
import SettingsList from "react-native-settings-list";
import Profile from "./EditProfile";
import Trends from "./Trends";
import MedicineSettings from "./MedicineSettings";
import { sendMail } from "../components/Mail/MailController";
import { exportDataMailFunc } from "../mailUtil/mailUtil.js";
import {
  asyncSettingUpdate,
  pullSettingsFromDatabase,
} from "../databaseUtil/databaseUtil";
import { profile_icons, IMAGES, COLOR } from "../resources/constants";

class Settings extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.state = {
      switchValue: false,
      name: "Name unknown",
      weight: "Weight unknown",
      birthday: new Date(),
      height_feet: "",
      height_inches: "",
      height: "Height unknown",
      icon: "0",
      email: "Doctor's email unkown",
      isEditVisible: false
    };
  }

  settingsUpdate(setting, value) {
    switch (setting) {
      case "name":
        this.setState({ name: value });
        break;
      case "weight":
        this.setState({ weight: value });
        break;
      case "birthday":
        this.setState({ birthday: value });
        break;
      case "height_feet":
        this.setState({
          height_feet: value,
          height: value + " ft " + this.state.height_inches + " in"
        });
        break;
      case "height_inches":
        this.setState({
          height_inches: value,
          height: this.state.height_feet + " ft " + value + " in"
        });
        break;
      case "icon":
        this.setState({ icon: value });
        break;
      case "email":
        this.setState({ email: value });
        break;
    }

    asyncSettingUpdate(setting, value);
  }

  componentDidMount() {
    pullSettingsFromDatabase(data => {
      console.log(data);
      this.setState({
        weight: data.weight,
        birthday: new Date(data.birthday),
        name: data.name,
        height_feet: data.height_feet,
        height_inches: data.height_inches,
        height: data.height_feet + "' " + data.height_inches + '" ',
        icon: data.icon,
        email: data.email
      });
      console.log("PULL SETTINGS FROM DB", data);
    });
  }

  render() {
    var bgColor = "#DCE3F4";

    return (
      <View style={styles.container}>
        <View
          style={{
            borderBottomWidth: 1,
            backgroundColor: "#f7f7f8",
            borderColor: "#c8c7cc"
          }}
        >
          <Text
            style={{
              alignSelf: "flex-start",
              marginTop: 35,
              marginLeft: 20,
              marginBottom: 10,
              fontWeight: "bold",
              fontSize: 35
            }}
          >
            Settings
          </Text>
        </View>
        <View style={styles.container}>
          <SettingsList borderColor="#c8c7cc" defaultItemSize={50}>
            <SettingsList.Header headerStyle={{ marginTop: 15 }} />
            <SettingsList.Item
              icon={
                <Image
                  style={styles.imageStyle}
                  height={100}
                  width={100}
                  resizeMode="cover"
                  source={profile_icons[this.state.icon]}
                />
              }
              hasNavArrow={false}
              title={this.state.name}
              titleInfo={"Edit" + "\n" + "Profile"}
              titleStyle={{ fontSize: 20, fontWeight: "bold" }}
              onPress={() => {
                this.setState({ isEditVisible: true });
              }}
            />
            <SettingsList.Header headerStyle={{ marginTop: 10 }} />
            <SettingsList.Item
              icon={
                <Image
                  style={styles.imageStyle}
                  height={50}
                  resizeMode="contain"
                  source={IMAGES.view}
                />
              }
              title="View History"
              hasNavArrow={true}
              onPress={() => {}}
              titleInfoStyle={styles.titleInfoStyle}
              onPress={() => {
                this.props.navigator.push(TrendsRoute);
              }}
            />

            <SettingsList.Item
              title="Contact"
              onPress={() => {
                sendMail(
                  [this.state.email],
                  "Comments on Your App",
                  "Dear Engineering World Health Body, \n",
                  null,
                  null
                );
              }}
              icon={
                <Image
                  style={styles.imageStyle}
                  height={60}
                  resizeMode="contain"
                  source={IMAGES.addressBook}
                />
              }
            />
            <SettingsList.Item
              icon={
                <Image
                  style={styles.imageStyle}
                  height={60}
                  resizeMode="contain"
                  source={IMAGES.exportcsv}
                />
              }
              title="Export Data"
              onPress={() => {
                //_mailFunc(this.state.email, this.state.name + "'s data");
                exportDataMailFunc(
                  this.state.email,
                  this.state.name + "'s symptom history"
                );
              }}
            />
            <SettingsList.Item
              icon={
                <Image
                  style={styles.imageStyle}
                  height={60}
                  resizeMode="contain"
                  source={IMAGES.medicine}
                />
              }
              title="Edit Medicine Settings"
              onPress={() => {
                this.props.navigator.push(MedicineSettingsPage);
              }}
            />
          </SettingsList>
        </View>
        <Modal
          isVisible={this.state.isEditVisible}
          style={styles.editProfileWrapper}
        >
          <Profile
            exitModal={() => {
              this.setState({ isEditVisible: false });
            }}
            settingsUpdate={(setting, value) => {
              console.log("entered settings update");
              this.settingsUpdate(setting, value);
            }}
            icon={this.state.icon}
            name={this.state.name}
            email={this.state.email}
            birthday={this.state.birthday}
            height_feet={this.state.height_feet}
            height_inches={this.state.height_inches}
            height={this.state.height}
            weight={this.state.weight}
            isInModal={true}
            baseColor={COLOR.black}
            baseColor={COLOR.black}
          />
        </Modal>
      </View>
    );
  }
  onValueChange(value) {
    this.setState({ switchValue: value });
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EFEFF4",
    flex: 1
  },
  avatar: {
    height: 100,
    width: 100,
    margin: 7
  },
  editProfileWrapper: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10
  },
  imageStyle: {
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
    alignSelf: "center",
    height: 55,
    width: 55
  },
  titleInfoStyle: {
    fontSize: 16,
    color: "#8e8e93"
  }
});
const ProfileRoute = {
  component: Profile,
  passProps: { myProp: "foo" }
};
const MedicineSettingsPage = {
  component: MedicineSettings
};
const TrendsRoute = {
  component: Trends
};
export default class settingsList extends React.Component {
  render() {
    return (
      <NavigatorIOS
        initialRoute={{
          component: Settings,
          title: "Settings"
        }}
        style={{ flex: 1 }}
        navigationBarHidden={true}
      />
    );
  }
}
