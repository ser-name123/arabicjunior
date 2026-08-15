export interface JobCardActionTypes {
  btnText: string;
  url: string;
}
export interface JobCardDataTypes {
  department: string;
  jobTitle: string;
  jobLocation: string;
  employmentType: string;
  jobType: string;
  action: JobCardActionTypes;
}
