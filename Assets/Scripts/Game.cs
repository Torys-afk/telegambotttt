using UnityEngine;
using UnityEngine.SceneManagement;

public enum GameState { Menu, Playing, GameOver }

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    public GameState state = GameState.Menu;
    public float speed = 8f;
    public float maxSpeed = 25f;
    public float distance;

    void Awake() { Instance = this; }
    void Start() { Invoke("StartGame", 0.5f); }

    void Update()
    {
        if (state != GameState.Playing) return;
        distance += speed * Time.deltaTime;
        speed = Mathf.Min(speed + 0.15f * Time.deltaTime, maxSpeed);
    }

    public void StartGame()
    {
        speed = 8f;
        distance = 0f;
        state = GameState.Playing;
    }

    public void GameOver()
    {
        state = GameState.GameOver;
    }

    public void Restart()
    {
        SceneManager.LoadScene(0);
    }
}

public class ScoreManager : MonoBehaviour
{
    public static ScoreManager Instance;
    public int score;
    public int coins;
    public int totalCoins;
    public int highScore;

    void Awake() { Instance = this; }
    void Start()
    {
        highScore = PlayerPrefs.GetInt("hs", 0);
        totalCoins = PlayerPrefs.GetInt("tc", 0);
    }

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;
        int d = (int)GameManager.Instance.distance;
        if (d > score) score = d;
    }

    public void AddCoin()
    {
        coins++;
    }

    public void SaveScore()
    {
        if (score > highScore)
        {
            highScore = score;
            PlayerPrefs.SetInt("hs", highScore);
        }
        totalCoins += coins;
        PlayerPrefs.SetInt("tc", totalCoins);
        PlayerPrefs.Save();
    }

    public void ResetScore()
    {
        score = 0;
        coins = 0;
    }
}

public class Player : MonoBehaviour
{
    public float laneSpeed = 12f;
    public float jumpForce = 10f;

    int lane = 1;
        float[] lanes = { -1f, 0f, 1f };
    Vector3 targetPos;
    Rigidbody rb;
    bool isGrounded;
    bool isSliding;
    float slideTimer;
    Vector2 touchStartPos;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        targetPos = transform.position;
    }

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        isGrounded = Physics.Raycast(transform.position + Vector3.up * 0.1f, Vector3.down, 0.2f);

        if (Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.LeftArrow))
            MoveLane(-1);
        if (Input.GetKeyDown(KeyCode.D) || Input.GetKeyDown(KeyCode.RightArrow))
            MoveLane(1);

        bool jumpPressed = Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.Space);
        if (jumpPressed && isGrounded && !isSliding)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            isGrounded = false;
        }

        if (Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.DownArrow))
            StartSlide();

        HandleTouch();

        Vector3 vel = rb.velocity;
        vel.z = GameManager.Instance.speed;
        rb.velocity = vel;

        Vector3 pos = transform.position;
        pos.x = Mathf.Lerp(pos.x, targetPos.x, laneSpeed * Time.deltaTime);
        transform.position = pos;

        if (isSliding)
        {
            slideTimer -= Time.deltaTime;
            if (slideTimer <= 0f)
                EndSlide();
        }
    }

    void HandleTouch()
    {
        if (Input.touchCount == 0) return;
        Touch touch = Input.GetTouch(0);

        if (touch.phase == TouchPhase.Began)
            touchStartPos = touch.position;

        if (touch.phase == TouchPhase.Ended)
        {
            Vector2 delta = touch.position - touchStartPos;
            if (delta.magnitude < 50f) return;

            if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
                MoveLane(delta.x > 0 ? 1 : -1);
            else if (delta.y > 0 && isGrounded)
                rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            else
                StartSlide();
        }
    }

    void MoveLane(int dir)
    {
        lane = Mathf.Clamp(lane + dir, 0, 2);
        targetPos.x = lanes[lane];
    }

    void StartSlide()
    {
        if (!isGrounded || isSliding) return;
        isSliding = true;
        slideTimer = 0.6f;
        transform.localScale = new Vector3(0.7f, 0.4f, 0.7f);
        GetComponent<BoxCollider>().center = new Vector3(0f, 0.2f, 0f);
    }

    void EndSlide()
    {
        isSliding = false;
        transform.localScale = new Vector3(0.7f, 1.2f, 0.7f);
        GetComponent<BoxCollider>().center = new Vector3(0f, 0.6f, 0f);
    }

    void OnCollisionEnter(Collision col)
    {
        if (col.gameObject.CompareTag("Ground"))
            isGrounded = true;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.GetComponent<Obstacle>() != null)
        {
            GameManager.Instance.GameOver();
        }
        if (other.GetComponent<CoinPickup>() != null)
        {
            ScoreManager.Instance.AddCoin();
            Destroy(other.gameObject);
        }
    }
}

public class CameraFollow : MonoBehaviour
{
    Transform player;
    Vector3 offset = new Vector3(0f, 4f, -6f);
    float smoothSpeed = 8f;

    void Start()
    {
        GameObject p = GameObject.FindGameObjectWithTag("Player");
        if (p != null) player = p.transform;
    }

    void LateUpdate()
    {
        if (player == null) return;
        if (GameManager.Instance != null && GameManager.Instance.state == GameState.Menu) return;

        Vector3 targetPos = player.position + offset;
        transform.position = Vector3.Lerp(transform.position, targetPos, smoothSpeed * Time.deltaTime);
        transform.LookAt(player.position + Vector3.up * 1.5f);
    }
}

public class Chaser : MonoBehaviour
{
    public float distance = 20f;
    float startDistance = 20f;

    void Start()
    {
        startDistance = distance;
    }

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        distance -= 0.3f * Time.deltaTime;

        if (distance < 2f)
        {
            GameManager.Instance.GameOver();
            return;
        }

        GameObject p = GameObject.FindGameObjectWithTag("Player");
        if (p == null) return;

        Vector3 targetPos = p.transform.position;
        targetPos.z -= distance;
        targetPos.y = 0.5f;
        transform.position = Vector3.Lerp(transform.position, targetPos, 3f * Time.deltaTime);

        transform.Rotate(Vector3.up, 180f * Time.deltaTime);
    }

    public void ResetChaser()
    {
        distance = startDistance;
    }
}

public class Obstacle : MonoBehaviour
{
    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        if (Camera.main != null && transform.position.z < Camera.main.transform.position.z - 10f)
            Destroy(gameObject);
    }
}

public class CoinPickup : MonoBehaviour
{
    float bobSpeed = 2f;
    float bobHeight = 0.15f;
    Vector3 startPos;

    void Start()
    {
        startPos = transform.position;
    }

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        transform.position = startPos + Vector3.up * Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.Rotate(Vector3.up, 120f * Time.deltaTime);
    }
}

public class Spawner : MonoBehaviour
{
    public GameObject obstaclePrefab;
    public GameObject obstaclePrefab2;
    public GameObject coinPrefab;
    float nextObstacle;
    float nextCoin;

    void Update()
    {
        if (GameManager.Instance == null) return;
        if (GameManager.Instance.state != GameState.Playing) return;

        if (Time.time > nextObstacle)
        {
            SpawnObstacle();
            float interval = Mathf.Max(0.5f, 1.8f / (1f + GameManager.Instance.speed * 0.04f));
            nextObstacle = Time.time + interval;
        }

        if (Time.time > nextCoin)
        {
            SpawnCoin();
            nextCoin = Time.time + Random.Range(0.8f, 2f);
        }
    }

    void SpawnObstacle()
    {
        if (obstaclePrefab == null) return;
        int laneIndex = Random.Range(0, 3);
        float[] laneX = { -1f, 0f, 1f };
        float z = 30f;

        GameObject prefab = Random.value > 0.5f && obstaclePrefab2 != null ? obstaclePrefab2 : obstaclePrefab;
        GameObject o = Instantiate(prefab);
        o.SetActive(true);
        o.transform.position = new Vector3(laneX[laneIndex], 0.4f, z);
        o.transform.SetParent(transform);
    }

    void SpawnCoin()
    {
        if (coinPrefab == null) return;
        int laneIndex = Random.Range(0, 3);
        float[] laneX = { -1f, 0f, 1f };

        int count = Random.Range(3, 7);
        for (int i = 0; i < count; i++)
        {
            GameObject c = Instantiate(coinPrefab);
            c.SetActive(true);
            c.transform.position = new Vector3(laneX[laneIndex], 0.7f, 20f + i * 1.5f);
            c.transform.SetParent(transform);
        }
    }
}

public class UIManager : MonoBehaviour
{
    Texture2D bgTex;

    void Awake()
    {
        bgTex = new Texture2D(1, 1);
    }

    void OnDestroy()
    {
        if (bgTex != null) Destroy(bgTex);
    }

    void OnGUI()
    {
        if (GameManager.Instance == null) return;

        switch (GameManager.Instance.state)
        {
            case GameState.Menu:
                DrawMenu();
                break;
            case GameState.Playing:
                DrawHUD();
                break;
            case GameState.GameOver:
                DrawGameOver();
                break;
        }
    }

    void DrawBg(Color color)
    {
        bgTex.SetPixel(0, 0, color);
        bgTex.Apply();
        GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), bgTex);
    }

    void DrawMenu()
    {
        DrawBg(new Color(0.05f, 0.05f, 0.2f, 0.92f));

        GUIStyle title = MakeStyle(48, true, new Color(1f, 1f, 0.3f));
        GUI.Label(new Rect(0, Screen.height * 0.2f, Screen.width, 80), "SPONGE BOB", title);
        GUI.Label(new Rect(0, Screen.height * 0.28f, Screen.width, 80), "KOSUSU", title);

        GUIStyle sub = MakeStyle(22, false, Color.white);
        GUI.Label(new Rect(0, Screen.height * 0.42f, Screen.width, 30),
            "En Yuksek Skor: " + ScoreManager.Instance.highScore, sub);

        GUIStyle coinStyle = MakeStyle(22, false, Color.yellow);
        GUI.Label(new Rect(0, Screen.height * 0.48f, Screen.width, 30),
            "Toplam Para: " + ScoreManager.Instance.totalCoins, coinStyle);

        GUIStyle hint = MakeStyle(16, false, new Color(0.7f, 0.7f, 0.7f));
        GUI.Label(new Rect(0, Screen.height * 0.56f, Screen.width, 25),
            "A/D veya Ok tuslari ile degis | W/Space/Zipla | S/Asagi = Kay", hint);

        if (GUI.Button(new Rect(Screen.width / 2f - 120, Screen.height * 0.65f, 240, 60), "OYNA"))
            GameManager.Instance.StartGame();
    }

    void DrawHUD()
    {
        GUIStyle scoreStyle = MakeStyle(40, true, Color.white);
        GUI.Label(new Rect(20, 20, 200, 50), "" + ScoreManager.Instance.score, scoreStyle);

        GUIStyle coinStyle = MakeStyle(24, true, Color.yellow);
        GUI.Label(new Rect(Screen.width - 180, 25, 160, 30),
            ScoreManager.Instance.coins + " Para", coinStyle);

        float speedPct = GameManager.Instance.speed / GameManager.Instance.maxSpeed;
        float barW = 200f;
        float barH = 8f;
        float barX = Screen.width / 2f - barW / 2f;
        float barY = 30f;

        Texture2D barBg = new Texture2D(1, 1);
        barBg.SetPixel(0, 0, new Color(0.3f, 0.3f, 0.3f, 0.8f));
        barBg.Apply();
        GUI.DrawTexture(new Rect(barX, barY, barW, barH), barBg);

        Texture2D barFill = new Texture2D(1, 1);
        barFill.SetPixel(0, 0, Color.Lerp(Color.green, Color.red, speedPct));
        barFill.Apply();
        GUI.DrawTexture(new Rect(barX, barY, barW * speedPct, barH), barFill);

        Destroy(barBg);
        Destroy(barFill);
    }

    void DrawGameOver()
    {
        if (ScoreManager.Instance != null)
            ScoreManager.Instance.SaveScore();

        DrawBg(new Color(0f, 0f, 0f, 0.8f));

        GUIStyle big = MakeStyle(52, true, Color.red);
        GUI.Label(new Rect(0, Screen.height * 0.2f, Screen.width, 60), "OYUN BITTI", big);

        GUIStyle score = MakeStyle(30, false, Color.white);
        GUI.Label(new Rect(0, Screen.height * 0.35f, Screen.width, 40),
            "Skor: " + ScoreManager.Instance.score, score);

        GUIStyle coinStyle = MakeStyle(26, false, Color.yellow);
        GUI.Label(new Rect(0, Screen.height * 0.42f, Screen.width, 35),
            "Para: " + ScoreManager.Instance.coins, coinStyle);

        GUIStyle best = MakeStyle(22, false, Color.cyan);
        GUI.Label(new Rect(0, Screen.height * 0.5f, Screen.width, 30),
            "En Iyi: " + ScoreManager.Instance.highScore, best);

        if (GUI.Button(new Rect(Screen.width / 2f - 120, Screen.height * 0.6f, 240, 60), "TEKRAR OYNA"))
            GameManager.Instance.Restart();
    }

    GUIStyle MakeStyle(int size, bool bold, Color color)
    {
        GUIStyle s = new GUIStyle(GUI.skin.label);
        s.fontSize = size;
        s.fontStyle = bold ? FontStyle.Bold : FontStyle.Normal;
        s.normal.textColor = color;
        s.alignment = TextAnchor.MiddleCenter;
        return s;
    }
}
