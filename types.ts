
export interface GreetingData {
  text: string;
  audioBase64?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  CELEBRATING = 'CELEBRATING',
  ERROR = 'ERROR'
}
