package com.example.alinhamais.models;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

public class StreakViewModel extends ViewModel {

    private SharedPreferences prefs;
    private HashMap<Integer, MutableLiveData<Integer>> counters = new HashMap<>();

    public void init(Context context) {
        prefs = context.getSharedPreferences("counter_prefs", Context.MODE_PRIVATE);
    }

    public MutableLiveData<Integer> getCounter(int itemId) {
        if (!counters.containsKey(itemId)) {
            // Carrega o numero contador ao invez de começar do zero
            int saved = prefs.getInt("counter_" + itemId, 0);
            counters.put(itemId, new MutableLiveData<>(saved));
        }
        return counters.get(itemId);
    }

    ///  ///dia//////////
    public void increment(int itemId) {
        if (!isLockedToday(itemId)) {
            int current = getCounter(itemId).getValue();
            int newValue = current + 1;
            getCounter(itemId).setValue(newValue);

            // Salva o novo contador e o dia de hj
            prefs.edit()
                    .putInt("counter_" + itemId, newValue)
                    .putString("date_" + itemId, getTodayDate())
                    .putString("last_check_date_" + itemId, getTodayDate())
                    .apply();
        }
    }

    public boolean isLockedToday(int itemId) {
        String lastDate = prefs.getString("date_" + itemId, "");
        return getTodayDate().equals(lastDate);
    }

    private String getTodayDate() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(new Date());
    }



    /// /// minuto (para testes) //////

    /*private String getCurrentMinute() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                .format(new Date());
    }

    public boolean isLockedToday(int itemId) {
        String lastDate = prefs.getString("date_" + itemId, "");
        return getCurrentMinute().equals(lastDate);
    }

    public void increment(int itemId) {
        if (!isLockedToday(itemId)) {
            int current = getCounter(itemId).getValue();
            int newValue = current + 1;
            getCounter(itemId).setValue(newValue);

            prefs.edit()
                    .putInt("counter_" + itemId, newValue)
                    .putString("date_" + itemId, getCurrentMinute())
                    .putString("last_check_date_" + itemId, getToday())
                    .apply();


        }
    }*/


    /// ///

    public boolean hasCheckedToday(int itemId) {
        String lastDate = prefs.getString("date_" + itemId, "");
        return getTodayDate().equals(lastDate);
    }

    /// //////


    public int getDayOfWeek() {
        Calendar calendar = Calendar.getInstance();
        return calendar.get(Calendar.DAY_OF_WEEK);
    }

    /// ///

    public void setDayCompleted(int lembreteId, int day) {
        prefs.edit()
                .putBoolean("day_" + lembreteId + "_" + day, true)
                .apply();
    }

    public boolean isDayCompleted(int lembreteId, int day) {
        return prefs.getBoolean("day_" + lembreteId + "_" + day, false);
    }

    public void resetWeek(int lembreteId) {
        SharedPreferences.Editor editor = prefs.edit();
        for (int day = 1; day <= 7; day++) {
            editor.putBoolean("day_" + lembreteId + "_" + day, false);
        }
        editor.apply();
    }

    /// ///

    public void checkStreakReset(int lembreteId) {
        String lastDate = prefs.getString("last_check_date_" + lembreteId, "");
        String yesterday = getYesterday();

        if (!lastDate.isEmpty() && !lastDate.equals(yesterday) && !lastDate.equals(getToday())) {
            getCounter(lembreteId).setValue(0);
            prefs.edit().putInt("counter_" + lembreteId, 0).apply();
        }
    }

    private String getYesterday() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -1);
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.getTime());
    }

    private String getToday() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
    }

}