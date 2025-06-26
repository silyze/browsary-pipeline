import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

export default class DatePackage extends EvaluationPackage<"date"> {
  readonly [PackageName] = "date";

  @title("Now")
  @description("Get the current date and time")
  @output("value", "string")
  @inline("{ value: new Date().toISOString() }")
  now: EvaluationNode = async () => {
    return { value: new Date().toISOString() };
  };

  @title("Unix Timestamp")
  @description("Current time as seconds since epoch")
  @output("value", "number")
  @inline("{ value: Math.floor(Date.now() / 1000) }")
  timestamp: EvaluationNode = async () => {
    return { value: Math.floor(Date.now() / 1000) };
  };

  @title("Format ISO Date")
  @description("Convert Date object or ISO string to ISO 8601")
  @input("value", "string")
  @output("value", "string")
  formatIso: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: new Date(value).toISOString() };
  };

  @title("Parse Date")
  @description("Parse a date string into milliseconds since epoch")
  @input("value", "string")
  @output("value", "number")
  parse: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: new Date(value).getTime() };
  };

  @title("Add Milliseconds")
  @description("Add milliseconds to a date")
  @input("value", "string")
  @input("ms", "number")
  @output("value", "string")
  addMilliseconds: EvaluationNode = async ({ value, ms }) => {
    assertType(value, "string", "value");
    assertType(ms, "number", "ms");
    const result = new Date(new Date(value).getTime() + ms);
    return { value: result.toISOString() };
  };

  @title("Difference (ms)")
  @description("Get difference in milliseconds between two dates")
  @input("a", "string")
  @input("b", "string")
  @output("value", "number")
  diffMilliseconds: EvaluationNode = async ({ a, b }) => {
    assertType(a, "string", "a");
    assertType(b, "string", "b");
    return {
      value: new Date(a).getTime() - new Date(b).getTime(),
    };
  };

  @title("Extract Date Component")
  @description("Extract a part of a date (year, month, etc.)")
  @input("value", "string")
  @input("part", "string")
  @output("value", "number")
  extract: EvaluationNode = async ({ value, part }) => {
    assertType(value, "string", "value");
    assertType(part, "string", "part");
    const d = new Date(value);
    const parts: Record<string, number> = {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
      ms: d.getUTCMilliseconds(),
      weekday: d.getUTCDay(),
    };
    return { value: parts[part] ?? NaN };
  };

  @title("Format Date")
  @description("Format a date using locale and options")
  @input("value", "string")
  @input("locale", "string")
  @input("options", "object")
  @output("value", "string")
  formatDate: EvaluationNode = async ({ value, locale, options }) => {
    assertType(value, "string", "value");
    assertType(locale, "string", "locale");
    assertType(options, "object", "options");

    const date = new Date(value);
    const formatter = new Intl.DateTimeFormat(
      locale,
      options as Intl.DateTimeFormatOptions
    );
    return { value: formatter.format(date) };
  };
  @title("Add Days")
  @description("Add days to a date")
  @input("value", "string")
  @input("days", "number")
  @output("value", "string")
  addDays: EvaluationNode = async ({ value, days }) => {
    assertType(value, "string", "value");
    assertType(days, "number", "days");
    const d = new Date(value);
    d.setUTCDate(d.getUTCDate() + days);
    return { value: d.toISOString() };
  };

  @title("Add Hours")
  @description("Add hours to a date")
  @input("value", "string")
  @input("hours", "number")
  @output("value", "string")
  addHours: EvaluationNode = async ({ value, hours }) => {
    assertType(value, "string", "value");
    assertType(hours, "number", "hours");
    const d = new Date(value);
    d.setUTCHours(d.getUTCHours() + hours);
    return { value: d.toISOString() };
  };

  @title("Add Minutes")
  @description("Add minutes to a date")
  @input("value", "string")
  @input("minutes", "number")
  @output("value", "string")
  addMinutes: EvaluationNode = async ({ value, minutes }) => {
    assertType(value, "string", "value");
    assertType(minutes, "number", "minutes");
    const d = new Date(value);
    d.setUTCMinutes(d.getUTCMinutes() + minutes);
    return { value: d.toISOString() };
  };

  @title("Add Seconds")
  @description("Add seconds to a date")
  @input("value", "string")
  @input("seconds", "number")
  @output("value", "string")
  addSeconds: EvaluationNode = async ({ value, seconds }) => {
    assertType(value, "string", "value");
    assertType(seconds, "number", "seconds");
    const d = new Date(value);
    d.setUTCSeconds(d.getUTCSeconds() + seconds);
    return { value: d.toISOString() };
  };

  @title("Add Years")
  @description("Add years to a date")
  @input("value", "string")
  @input("years", "number")
  @output("value", "string")
  addYears: EvaluationNode = async ({ value, years }) => {
    assertType(value, "string", "value");
    assertType(years, "number", "years");
    const d = new Date(value);
    d.setUTCFullYear(d.getUTCFullYear() + years);
    return { value: d.toISOString() };
  };

  @title("Add Months")
  @description("Add months to a date")
  @input("value", "string")
  @input("months", "number")
  @output("value", "string")
  addMonths: EvaluationNode = async ({ value, months }) => {
    assertType(value, "string", "value");
    assertType(months, "number", "months");
    const d = new Date(value);
    d.setUTCMonth(d.getUTCMonth() + months);
    return { value: d.toISOString() };
  };
}
