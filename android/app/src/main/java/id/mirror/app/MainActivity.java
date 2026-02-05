package id.mirror.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ensurePermissions();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            getBridge()
                .getWebView()
                .setWebChromeClient(
                    new WebChromeClient() {
                        @Override
                        public void onPermissionRequest(final PermissionRequest request) {
                            runOnUiThread(
                                () -> {
                                    try {
                                        request.grant(request.getResources());
                                    } catch (Exception e) {
                                        request.deny();
                                    }
                                }
                            );
                        }
                    }
                );
        }
    }

    private void ensurePermissions() {
        boolean cameraGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        boolean audioGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
        if (cameraGranted && audioGranted) {
            return;
        }
        ActivityCompat.requestPermissions(
            this,
            new String[] { Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO },
            PERMISSION_REQUEST_CODE
        );
    }
}
