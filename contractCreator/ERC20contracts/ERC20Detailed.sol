


/**
 * @title ERC20Detailed token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
contract ERC20Detailed is IERC20 {
  string private _name;
  string private _symbol;
  string private _industry;
  string private _isin;
  string private _cusip;
  string private _moodys;
  string private _snp;
  string private _fitch;
  string private _fsdate;
  string private _maturitydate;
  string private _facevalue;
  string private _amtstanding;
  string private _types;
  string private _frequency;
  string private _firstDate;
  string private _rate;
  string private _benchmark;


  uint8 private _decimals;


  constructor(string name, string symbol,string industry,string isin,string cusip,string moodys,
  string snp,string fitch, string fsdate, string maturitydate,string facevalue,string amtstanding,string types,
  string frequency,string firstDate,string rate,string benchmark, uint8 decimals) public {
    _name = name;
    _symbol = symbol;
    _decimals = decimals;
    _industry = industry;
    _isin = isin;
    _cusip = cusip;
    _moodys = moodys;
    _snp = snp;
    _fitch = fitch;
    _fsdate = fsdate;
    _maturitydate = maturitydate;
    _facevalue = facevalue;
    _amtstanding = amtstanding;
    _types = types;
    _frequency = frequency;
    _firstDate = firstDate;
    _rate = rate;    
    _benchmark = benchmark;
  }

  /**
   * @return the name of the token.
   */
  function name() public view returns(string) {
    return _name;
  }

  /**
   * @return the symbol of the token.
   */
  function symbol() public view returns(string) {
    return _symbol;
  }

  /**
   * @return the number of decimals of the token.
   */
  function decimals() public view returns(uint8) {
    return _decimals;
  }

  /**
   * @return the _industry of the token.
   */
  function industry() public view returns(string) {
    return _industry;
  }

  /**
   * @return the isin of the token.
   */
  function isin() public view returns(string) {
    return _isin;
  }

  /**
   * @return the cusip of the token.
   */
  function cusip() public view returns(string) {
    return _cusip;
  }

  /**
   * @return the moodys of the token.
   */
  function moodys() public view returns(string) {
    return _moodys;
  }

  /**
   * @return the snp of the token.
   */
  function snp() public view returns(string) {
    return _snp;
  }

  /**
   * @return the fitch of the token.
   */
  function fitch() public view returns(string) {
    return _fitch;
  }

   /**
   * @return the fsdate of the token.
   */
  function fsdate() public view returns(string) {
    return _fsdate;
  }

   /**
   * @return the maturitydate of the token.
   */
  function maturitydate() public view returns(string) {
    return _maturitydate;
  }

   /**
   * @return the facevalue of the token.
   */
  function facevalue() public view returns(string) {
    return _facevalue;
  }

   /**
   * @return the amtstanding of the token.
   */
  function amtstanding() public view returns(string) {
    return _amtstanding;
  }

   /**
   * @return the type of the token.
   */
  function types() public view returns(string) {
    return _types;
  }

   /**
   * @return the frequency of the token.
   */
  function frequency() public view returns(string) {
    return _frequency;
  }

  /**
   * @return the firstDate of the token.
   */
  function firstDate() public view returns(string) {
    return _firstDate;
  }

  /**
   * @return the benchmark of the token.
   */
  function benchmark() public view returns(string) {
    return _benchmark;
  }

  /**
   * @return the rate of the token.
   */
  function rate() public view returns(string) {
    return _rate;
  }


}
