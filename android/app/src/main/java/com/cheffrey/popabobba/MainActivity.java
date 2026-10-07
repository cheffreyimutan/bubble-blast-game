package com.cheffrey.popabobba;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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
