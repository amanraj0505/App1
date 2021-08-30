package com.app1;

import static androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG;
import static androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK;
import static androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL;

import android.app.Activity;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.Executor;

public class BiometricModule extends ReactContextBaseJavaModule{
    private Activity activity = null;
    BiometricModule(ReactApplicationContext context, Activity activity){
        super(context);
        this.activity = activity;
    }

    @NonNull
    @Override
    public String getName() {
       return BiometricModule.class.getSimpleName();
    }
    @ReactMethod
    public String checkBiometricAvailable(){
        String result = null;
        BiometricManager biometricManager = BiometricManager.from(getReactApplicationContext());
        switch (biometricManager.canAuthenticate(BIOMETRIC_STRONG | DEVICE_CREDENTIAL)) {
            case BiometricManager.BIOMETRIC_SUCCESS:
                result =  "SUCCESS";
                break;
            case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
                result = "NO HARDWARE AVAILABLE";
                break;
            case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
                result = "NO HARDWARE";
                break;
            case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
                result =  "NOT ENROLLED";
                break;
            default:
                result = null;
        }
        return  result;
    }
    @ReactMethod
    public void authenticateUser(){
         Executor executor;
         BiometricPrompt biometricPrompt;
         BiometricPrompt.PromptInfo promptInfo;
         final boolean []finalResult = {false};
        executor = ContextCompat.getMainExecutor(getReactApplicationContext());
        biometricPrompt = new BiometricPrompt((FragmentActivity) activity, executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                finalResult[0] = false;
            }

            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                finalResult[0] = true;
            }

            @Override
            public void onAuthenticationFailed() {
                super.onAuthenticationFailed();
                finalResult[0] = false;
            }
        });
        promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric login for my app")
                .setSubtitle("Log in using your biometric credential")
                .setAllowedAuthenticators(BIOMETRIC_STRONG | DEVICE_CREDENTIAL| BIOMETRIC_WEAK)
                .build();
        biometricPrompt.authenticate(promptInfo);
    }
}
