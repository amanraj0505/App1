import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  ScrollView,
  Platform,
  ViewPropTypes,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import crashlytics from '@react-native-firebase/crashlytics';
import PropTypes from 'prop-types';
import ReactNativeBiometrics from 'react-native-biometrics';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      encryptedText: null,
      decryptedText: '',
      errorMessageLegacy: undefined,
      biometricLegacy: undefined,
      loading: false,
    };
  }
  async componentDidMount() {
    const {biometryType} = await ReactNativeBiometrics.isSensorAvailable();
  }
  componentWillUnmount = () => {
    FingerprintScanner.release();
  };
  requiresLegacyAuthentication() {
    return Platform.Version < 23;
  }

  async authCurrent(biometryType) {
    FingerprintScanner.authenticate({
      title: 'Log in with ' + biometryType,
      subTitle: 'Aman',
      description: 'fingerprint scanner',
      cancelButton: 'dismiss',
      onAttempt: () => {
        console.log('try again');
      },
    })
      .then(() => console.log('authenticated.....'))
      .catch(error => console.log(error));
  }

  handleAuthenticationAttemptedLegacy = error => {
    this.setState({errorMessageLegacy: error.message});
    this.description.shake();
  };

  authLegacy() {
    FingerprintScanner.authenticate({
      onAttempt: this.handleAuthenticationAttemptedLegacy,
    })
      .then(() => {
        this.props.handlePopupDismissedLegacy();
        Alert.alert('Fingerprint Authentication', 'Authenticated successfully');
      })
      .catch(error => {
        this.setState({
          errorMessageLegacy: error.message,
          biometricLegacy: error.biometric,
        });
        this.description.shake();
      });
  }

  renderLegacy() {
    const {errorMessageLegacy, biometricLegacy} = this.state;
    const {style, handlePopupDismissedLegacy} = this.props;

    return (
      <View style={styles.container}>
        <View style={[styles.contentContainer, style]}>
          <Image style={styles.logo} source={require('./fingerprint.png')} />

          <Text style={styles.heading}>Biometric{'\n'}Authentication</Text>
          <Text
            ref={instance => {
              this.description = instance;
            }}
            style={styles.description(!!errorMessageLegacy)}>
            {errorMessageLegacy ||
              `Scan your ${biometricLegacy} on the\ndevice scanner to continue`}
          </Text>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handlePopupDismissedLegacy}>
            <Text style={styles.buttonText}>BACK TO MAIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  render() {
    if (this.requiresLegacyAuthentication()) {
      return this.renderLegacy();
    }
    return (
      <SafeAreaView>
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
          <Button
            title="CRASH"
            onPress={async () => {
              crashlytics().crash();
            }}
          />
        </View>
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
          <Button
            title="Fetch"
            onPress={async () => {
              fetch(
                'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query=Stockholm',
                {
                  method: 'GET',
                  headers: {
                    'x-rapidapi-key': '{x-rapidapi-key}',
                    'x-rapidapi-host':
                      'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
                  },
                },
              )
                .then(response => {
                  console.log(response);
                })
                .catch(err => {
                  console.error(err);
                });
            }}
          />
        </View>
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
          <Button
            title="Autheticate"
            onPress={async () => {
              FingerprintScanner.isSensorAvailable()
                .then(biometryType => {
                  if (this.requiresLegacyAuthentication()) {
                    this.authLegacy(biometryType);
                  } else {
                    this.authCurrent(biometryType);
                  }
                })
                .catch(error => console.log(error));
            }}
          />
        </View>
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
          <Button
            title="Register"
            onPress={async () => {
              this.setState({loading: true});
              const keys = await ReactNativeBiometrics.createKeys('aman').then(
                resultObject => {
                  this.setState({loading: false});
                },
              );
              ReactNativeBiometrics.createSignature({
                promptMessage: 'Sign In',
                payload: 'aman',
              })
                .then(resultObject => {
                  const {success, signature} = resultObject;
                  if (success) {
                    console.log(signature);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            }}
          />
          <ActivityIndicator
            size={'large'}
            animating={this.state.loading}
            color={'red'}
            style={{marginTop: 20, marginBottom: 20}}
          />
        </View>
        <View
          style={{
            marginTop: 10,
            alignItems: 'center',
          }}>
          <Button
            title="Unregister"
            onPress={async () => {
              ReactNativeBiometrics.deleteKeys().then(resultObject => {
                console.log(resultObject);
              });
            }}
          />
        </View>
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
          }}>
          <Button
            title="Verify"
            onPress={async () => {
              var keyexist = (await ReactNativeBiometrics.biometricKeysExist())
                .keysExist;
              if (!keyexist) {
                Alert.alert(
                  'No Biometric Registered',
                  'Please Register biometric First',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                  ],
                );
              } else {
                ReactNativeBiometrics.createSignature({
                  promptMessage: 'Sign in',
                  payload: 'payload',
                }).then(resultObject => {
                  const {success, signature} = resultObject;

                  if (success) {
                    console.log(signature);
                  }
                });
              }
            }}
          />
        </View>
        <ScrollView>
          <Text
            style={{
              marginTop: 40,
              color: '#576574',
              fontSize: 18,
            }}>
            {this.state.encryptedText?.cipher}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
App.propTypes = {
  handlePopupDismissedLegacy: PropTypes.func,
  style: ViewPropTypes.style,
};
export default App;
