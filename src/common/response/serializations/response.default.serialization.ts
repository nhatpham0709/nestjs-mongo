import { ApiProperty } from '@nestjs/swagger';
import { IMessage } from 'src/common/message/interfaces/message.interface';

export class ResponseMetadataSerialization {
    languages: string[];
    timestamp: number;
    timezone: string;
    requestId: string;
    path: string;
    version: string;
    repoVersion: string;
    [key: string]: any;
}

export class ResponseDefaultSerialization<T = Record<string, any>> {
    @ApiProperty({
        name: 'statusCode',
        type: Number,
        required: true,
        nullable: false,
        description: 'return specific status code for every endpoints',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        name: 'message',
        required: true,
        nullable: false,
        description: 'Message base on language',
        oneOf: [
            {
                type: 'string',
                example: 'message endpoint',
            },
            {
                type: 'object',
                example: {
                    en: 'This is test endpoint.',
                    vi: 'Đây là endpoint test.',
                },
            },
        ],
    })
    message: string | IMessage;

    @ApiProperty({
        name: '_metadata',
        required: true,
        nullable: false,
        description: 'Contain metadata about API',
        type: 'object',
        example: {
            languages: ['vi'],
            timestamp: 1660190937231,
            timezone: 'Asia/Ho_Chi_Minh',
            requestId: '40c2f734-7247-472b-bc26-8eff6e669781',
            path: '/api/v1/test/hello',
            version: '1',
            repoVersion: '1.0.0',
        },
    })
    _metadata: ResponseMetadataSerialization;

    data?: T;
}
