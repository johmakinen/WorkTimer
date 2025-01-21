A simple app to keep track my working time.
UI:
- Has a button with <text> for the project.
- Pressing the button starts the timer. Pressing the button again stops the timer.
- The timer shows the time in hours, minutes and seconds.
- The timer logs the time spent on the project into a file.
- The timer can be reset with the reset button.



TODO:
- [ ] Larger and prettier buttons
- [ ] Pretty up the UI
- [x] Scale the elements with the window size
- [x] Optional:
    - A button for only-one-project-at-a-time mode
    - In this mode, the timer stops when another project is started.
    - Only one timer can be running at a time.
    - The individual project timers can still be reset with the their reset buttons.
- [x] The total time spent on all projects is shown in the main timer.
- [x] Log all projects into a single file when closing the app.
- [x] The log file is in CSV format with the following columns:
    - Project name
    - Start time (ISO 8601)
    - End time
    - Duration