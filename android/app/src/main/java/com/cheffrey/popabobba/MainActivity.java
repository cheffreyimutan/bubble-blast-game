package com.cheffrey.popabobba;

import android.os.Bundle;
import android.webkit.WebSettings;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Called after super.onCreate() (not before) - Capacitor's BridgeActivity installs the
        // core-splashscreen compat view inside its own onCreate(), and calling this first produced
        // a phantom extra top bar on at least one tested OS build. Android 15+ (SDK 35+) already
        // enforces edge-to-edge automatically given this app's targetSdk, so this call's only job
        // is consistent behavior back to minSdk 24, where it's not automatic.
        EdgeToEdge.enable(this);
        // Capacitor's default Bridge setup only hides the on-screen zoom control widget
        // (setBuiltInZoomControls) - it never calls setSupportZoom(false), so native
        // pinch-zoom/pan gesture handling stays live underneath the page's own
        // user-scalable=no viewport hint. Some OEM WebView builds don't fully honor that
        // CSS-level hint, and a stray multi-touch signal (plausible right as the phone
        // also buzzes from a chain-reaction hit) can leave the WebView's native zoom/pan
        // state shifted - which nothing in the page itself can detect or undo, only a
        // reload resets it. Disabling zoom at the WebView-settings level closes that gap.
        WebSettings settings = getBridge().getWebView().getSettings();
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
    }
}
