# Product Team Technical Challenge

## Situation

You have been contracted to provide a monitoring solution for a local community
swimming pool.  The pool has a chlorine sensor that measures the chlorine levels
at set intervals and then transmits the measurements.

The customer already has a server in place to supply the data.  What they need
now is a web-based front end that the operator can use to monitor the chlorine
levels for both the past 24 hours and going forward in real time.

## Requirements

Create a page in HTML and JavaScript that connects to the server via websocket
and then plots the data returned in a line chart.  The page needs to show the
name of the location being monitored.  The chart needs to show the time along
the x-axis and the chlorine level along the y-axis.  The chlorine level is
measured in parts per million (ppm).  The page also needs to alert the operator
if the chlorine level drops below 1.0 ppm or above 3.0 ppm.

On first connection, the server will return an array containing the previous 24
hours of data in the following format:
```
{
  orgName: "Community Pool",
  orgID: 7,
  sensorName: "Chlorine Level",
  sensorID: 21,
  timestamp: timestamp,
  value: number
}
```

Once the existing data has been sent, the server will then start to return the
real time measurements.  The chlorine level is measured every five minutes to
make sure that it stays within the acceptable range.  For the purposes of this
exercise, the server will actually be sending the data every five seconds.  The
data is in the same format as the historic data except that it is not an array.

The server will continue to send data until the client disconnects.

## Instructions

The server is written in javascript for nodejs and runs from the command line.
It runs on port `8080`.  Follow these instructions to run it:

1. Install Nodejs
2. Install the `ws` and `moment` packages into your Node environment
3. Run the server with the command `node server.js`
4. To stop the server use `Ctrl-C`