
// Android (Kotlin) — Minimal TSPL Sender via Bluetooth SPP
// Manifest: <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
// Pair the M220 in system Bluetooth first.

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import java.io.OutputStream
import java.util.UUID

fun printTspl(tspl: String, deviceName: String = "M220") {
    val adapter = BluetoothAdapter.getDefaultAdapter() ?: return
    val device: BluetoothDevice = adapter.bondedDevices.first { it.name.contains(deviceName, true) }
    val uuid = device.uuids?.firstOrNull()?.uuid ?: UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // SPP
    val socket = device.createRfcommSocketToServiceRecord(uuid)
    socket.connect()
    val os: OutputStream = socket.outputStream
    os.write(tspl.toByteArray(Charsets.UTF_8))
    os.flush()
    os.close()
    socket.close()
}
