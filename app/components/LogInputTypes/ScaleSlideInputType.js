import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import { IMAGES, COLOR } from '../../resources/constants';

const SELECTED_COLOR = COLOR.blue;
const TITLE = 'How intense is your pain?';
const numericImageChoices = [
  IMAGES.zero,
  IMAGES.one,
  IMAGES.two,
  IMAGES.three,
  IMAGES.four,
  IMAGES.five,
  IMAGES.six,
  IMAGES.seven,
  IMAGES.eight,
  IMAGES.nine,
  IMAGES.ten
];
/* each element is of the form [<color>, <numberTitle>, Summary>]
https://paindoctor.com/pain-scales/ (Color scheme from #11)
*/
const numericMetaInfo = [
  ['rgb(140, 234, 255)', 'No Pain'],
  ['rgb(105, 183, 140)', 'Minimal'],
  ['rgb(122, 208, 105)', 'Mild'],
  ['rgb(155, 232, 77)', 'Uncomfortable'],
  ['rgb(195, 237, 71)', 'Moderate'],
  ['rgb(240, 196, 46)', 'Distracting'],
  ['rgb(233, 161, 38)', 'Distressing'],
  ['rgb(226, 114, 38)', 'Unmanageable'],
  ['rgb(221, 63, 31)', 'Intense'],
  ['rgb(187, 1, 1)', 'Severe'],
  ['rgb(125, 1, 1)', 'Unable to Move']
]; //find 10 colors that show intensity
//INTENSITY PAGE
export default class ScaleSlideInputType extends React.Component {
  static propTypes = {
    val_label: PropTypes.string,
    valueChange: PropTypes.func,
    label_left: PropTypes.string,
    label_right: PropTypes.string,
    question: PropTypes.string,
    scale_labels: PropTypes.array, //looks like dead code, check
    value: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      viewportWidth: 1,
      viewportHeight: 1,
      selected: 0
    };
  }

  /*
  Take in a native event (part of the object passed in from onLayout)

  Sets global variables viewportWidth and viewportHeight according to the size
  of the screen
  */
  _setGlobalHeightAndWidth(nativeEvent) {
    this.setState({ viewportHeight: nativeEvent.layout.height });
    this.setState({ viewportWidth: nativeEvent.layout.width }, () => {});
  }

  change(value) {
    this.setState({ value: parseFloat(value) }, () =>
      this.props.valueChange(this.props.val_label, this.state.value)
    );
  }

  _renderBodyImageType() {
    let body = null;
    if (this.props.isIntensitySlider) {
      body = this.props.scale_labels.map((option, i, arr) => {
        let width = this.state.viewportWidth / arr.length;

        return (
          <TouchableOpacity
            key={i}
            onPress={() => {
              this.change(i);
              this.setState({ selected: i });
            }}
            style={[
              styles.button,
              {
                borderRadius: 0,
                backgroundColor: numericMetaInfo[i],
                height: width,
                width: width
              }
            ]}
          >
            <Text style={[styles.buttonText]}>{i}</Text>
          </TouchableOpacity>
        );
      });
    } else {
      body = this.props.scale_labels.map((option, i, arr) => {
        let width = this.state.viewportWidth / arr.length;

        return (
          <TouchableOpacity
            key={i}
            onPress={() => {
              this.change(i);
              this.setState({ selected: i });
            }}
            style={[
              styles.button,
              {
                backgroundColor:
                  this.state.selected == i ? SELECTED_COLOR : 'transparent'
              }
            ]}
          >
            <Image
              source={numericImageChoices[i]}
              style={[
                styles.imgStyle,
                {
                  width: width,
                  height: width
                }
              ]}
            />
          </TouchableOpacity>
        );
      });
    }
    return <View style={styles.body}>{body}</View>;
  }

  /**
   * Based on this.props.isSlider, will return a slider or a button scale input
   */
  _renderBody() {
    let scale = this._renderBodyImageType();

    return (
      <View
        onLayout={({ nativeEvent }) => {
          this._setGlobalHeightAndWidth(nativeEvent);
        }}
      >
        <View style={styles.label_view}>
          <Text style={styles.label_text}>{this.props.label_left}</Text>
          <Text style={styles.label_text}>{this.props.label_right}</Text>
        </View>
        {scale}
      </View>
    );
  }

  _renderFooterLabel() {
    if (this.props.isIntensitySlider) {
      return (
        <View
          style={[
            styles.intensityLabelContainer,
            {
              width: this.state.viewportWidth,
              backgroundColor: numericMetaInfo[this.state.selected][0]
            }
          ]}
        >
          <Text style={styles.intensityLabel}>
            {numericMetaInfo[this.state.selected][1]}
          </Text>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.questionText}>
            {this.props.question || TITLE}
          </Text>
        </View>
        <View style={[styles.bottomHalf]}>
          {this._renderBody()}
          {this._renderFooterLabel()}
        </View>
        {/*Render the intensity labels underneath if necessary*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'stretch'
  },
  button: {
    padding: 0,
    borderRadius: 50,
    justifyContent: 'center'
  },
  bottomHalf: {
    alignItems: 'stretch'
  },
  questionText: {
    fontSize: 40,
    fontWeight: '100',
    textAlign: 'center'
  },
  imgStyle: {
    resizeMode: 'contain'
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  label_view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  label_text: {
    fontSize: 18,
    fontWeight: '100'
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center'
  },
  intensityLabelContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  intensityLabel: {
    fontSize: 25,
    fontWeight: '200',
    color: 'white'
  }
});
