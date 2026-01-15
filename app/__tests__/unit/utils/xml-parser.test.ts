/**
 * XML Parser 유틸리티 테스트
 */
import {
  parseXml,
  extractItemsFromXml,
  extractTotalCountFromXml,
  extractResultFromXml,
} from '@/utils/xml-parser';

describe('xml-parser', () => {
  describe('parseXml', () => {
    it('유효한 XML을 JSON으로 변환한다', () => {
      const xml = '<root><name>test</name><value>123</value></root>';
      const result = parseXml<{ root: { name: string; value: number } }>(xml);

      expect(result.root.name).toBe('test');
      expect(result.root.value).toBe(123);
    });

    it('속성을 포함한 XML을 파싱한다', () => {
      const xml = '<item id="1" type="test">content</item>';
      const result = parseXml<{ item: { '@_id': string; '@_type': string; '#text': string } }>(xml);

      expect(result.item['@_id']).toBe('1');
      expect(result.item['@_type']).toBe('test');
    });

    it('빈 문자열에 대해 에러를 던진다', () => {
      expect(() => parseXml('')).toThrow('Invalid XML input');
    });

    it('null/undefined에 대해 에러를 던진다', () => {
      expect(() => parseXml(null as unknown as string)).toThrow('Invalid XML input');
      expect(() => parseXml(undefined as unknown as string)).toThrow('Invalid XML input');
    });
  });

  describe('extractItemsFromXml', () => {
    it('표준 공공 API 응답에서 아이템 배열을 추출한다', () => {
      const xml = `
        <response>
          <body>
            <items>
              <item><id>1</id><name>first</name></item>
              <item><id>2</id><name>second</name></item>
            </items>
          </body>
        </response>
      `;

      const items = extractItemsFromXml<{ id: number; name: string }>(xml);

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(1);
      expect(items[1].name).toBe('second');
    });

    it('단일 아이템을 배열로 변환한다', () => {
      const xml = `
        <response>
          <body>
            <items>
              <item><id>1</id></item>
            </items>
          </body>
        </response>
      `;

      const items = extractItemsFromXml<{ id: number }>(xml);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(1);
    });

    it('아이템이 없으면 빈 배열을 반환한다', () => {
      const xml = `
        <response>
          <body>
            <items></items>
          </body>
        </response>
      `;

      const items = extractItemsFromXml(xml);

      expect(items).toEqual([]);
    });

    it('커스텀 경로로 아이템을 추출한다', () => {
      const xml = `
        <data>
          <results>
            <result><value>test</value></result>
          </results>
        </data>
      `;

      const items = extractItemsFromXml<{ value: string }>(xml, ['data', 'results', 'result']);

      expect(items).toHaveLength(1);
      expect(items[0].value).toBe('test');
    });
  });

  describe('extractTotalCountFromXml', () => {
    it('totalCount를 추출한다', () => {
      const xml = `
        <response>
          <body>
            <totalCount>100</totalCount>
          </body>
        </response>
      `;

      expect(extractTotalCountFromXml(xml)).toBe(100);
    });

    it('totalCount가 없으면 0을 반환한다', () => {
      const xml = '<response><body></body></response>';

      expect(extractTotalCountFromXml(xml)).toBe(0);
    });
  });

  describe('extractResultFromXml', () => {
    it('성공 응답 코드 "00"을 파싱한다', () => {
      const xml = `
        <response>
          <header>
            <resultCode>00</resultCode>
            <resultMsg>정상처리</resultMsg>
          </header>
        </response>
      `;

      const result = extractResultFromXml(xml);

      expect(result.code).toBe('00');
      expect(result.message).toBe('정상처리');
      expect(result.success).toBe(true);
    });

    it('성공 응답 코드 "0000"을 파싱한다', () => {
      const xml = `
        <response>
          <header>
            <resultCode>0000</resultCode>
            <resultMsg>SUCCESS</resultMsg>
          </header>
        </response>
      `;

      const result = extractResultFromXml(xml);

      expect(result.success).toBe(true);
    });

    it('에러 응답 코드를 파싱한다', () => {
      const xml = `
        <response>
          <header>
            <resultCode>99</resultCode>
            <resultMsg>인증 오류</resultMsg>
          </header>
        </response>
      `;

      const result = extractResultFromXml(xml);

      expect(result.code).toBe('99');
      expect(result.message).toBe('인증 오류');
      expect(result.success).toBe(false);
    });
  });
});
