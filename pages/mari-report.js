import Head from 'next/head';
import {
  Container,
  Button,
  FormControl,
  Select,
  NativeSelect,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@mui/material/TextField';
import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import moment from 'moment';
import axios from 'axios';
import _get from 'lodash/get';
import { Line } from 'react-chartjs-2';

import style from '../components/mari.module.css';
import { useState, useEffect } from 'react';
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const host_report_api = 'http://localhost:5000/reports';

const MariReport = () => {
  const [timeInterval, setTimeInterval] = useState(1);
  const [chartData, setChartData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  const classes = useStyles();

  const handleChange = async (event) => {
    const _int = event.target.value;
    setTimeInterval(_int);
    await fetchData();
  };

  const fetchData = async () => {
    let res = await axios({
      method: 'POST',
      url: host_report_api,
      data: {
        gte: moment.utc().subtract(1, 'day').format('YYYY,MM-DD HH:mm:ss'),
        lte: '',
      },
    });
    let _buckets = _get(res.data, 'result_data.aggregations.3.buckets', []);
    console.log('===== Buckets ====');
    console.log(_buckets);
    handleBuckets(_buckets, 'web-chat');
  };

  const handleBuckets = (buckets = [], channel) => {
    let key_labels = [];
    let ivr = [];
    let web_chat = [];
    let facebook = [];
    let line = [];

    buckets.forEach((bc) => {
      key_labels.push(
        moment(_get(bc, 'key_as_string')).format('DD-MM-YYYY HH:mm:ss')
      );
      let arr_bucket = _get(bc, '2.buckets', []);
      arr_bucket.forEach((doc) => {
        if (doc.key == 'web-chat') {
          web_chat.push(doc.doc_count);
        } else if (doc.key == 'ivr') {
          ivr.push(doc.doc_count);
        } else if (doc.key == 'facebook') {
          facebook.push(doc.doc_count);
        } else if (doc.key == 'line') {
          line.push(doc.doc_count);
        }
      });
    });

    let _chart_data = {
      labels: key_labels,
      datasets: [
        {
          label: `Web chat (${web_chat.length})`,
          data: web_chat,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
          //yAxisID: 'y-axis-1',
        },
        {
          label: `IVR (${ivr.length})`,
          data: ivr,
          backgroundColor: 'rgb(60, 179, 113)',
          borderColor: 'rgb(60, 179, 113, 0.2)',
          //yAxisID: 'y-axis-2',
        },
        {
          label: `Facebook (${facebook.length})`,
          data: facebook,
          backgroundColor: 'rgb(0, 0, 255)',
          borderColor: 'rgb(0, 0, 255, 0.2)',
          //yAxisID: 'y-axis-2',
        },
        {
          label: `Line (${line.length})`,
          data: line,
          backgroundColor: 'rgb(255, 165, 0)',
          borderColor: 'rgb(255, 165, 0, 0.2)',
          //yAxisID: 'y-axis-2',
        },
      ],
    };
    setChartData(_chart_data);
  };

  return (
    <>
      <Head>
        <title>Mari Report</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
      </Head>
      <div className={style.flex_container}>
        <div className={style.search_bar}>
          {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
              <DateRangePicker
                startText=""
                endText=""
                value={dateRange}
                onChange={handleDatePicker}
                calendars={2}
                renderInput={(startProps, endProps) => (
                  <>
                    <TextField {...startProps} id="datetime-local" />
                    <Box sx={{ mx: 4 }}> to </Box>
                    <TextField {...endProps} id="datetime-local" />
                  </>
                )}
              />
            </Box>
          </LocalizationProvider> */}
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-simple">Time Interval</InputLabel>
            <Select
              native
              value={timeInterval}
              onChange={handleChange}
              inputProps={{
                name: 'timeInterval',
                id: 'interval-native-simple',
              }}
            >
              <option value={1}>1 minutes</option>
              <option value={2}>2 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </Select>
          </FormControl>
        </div>
        <div className={style.graph_content}>
          {chartData && <Line width={80} height={30} data={chartData} />}
        </div>
      </div>
    </>
  );
};

export default MariReport;
