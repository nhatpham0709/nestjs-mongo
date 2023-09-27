export interface IHelperHashService {
    bcryptCompare(passwordString: string, passwordHashed: string): boolean;
    sha256(string: string): string;
    sha256Compare(hashOne: string, hashTwo: string): boolean;
}
