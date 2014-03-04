<h1>ENV</h1>

<p><?= $env->timestamp; ?> | <?= $env->latitude; ?> | <?= $env->longitude; ?></p>

<a href="/user/<?= $env->username ?>"><?= $env->username ?>'s profile</a>

<div id="model"><img src="/img/placeholder.gif" alt="<?= $env->name; ?>"/></div>

<div id="env"></div>

<video id="video" autoplay></video>
<canvas id="canvas"></canvas>
<canvas id="comp"></canvas>

<label for="sensitivity">more sensitive</label> <input type="radio" name="sensitivity">
<label for="sensitivity">average</label> <input type="radio" name="sensitivity" checked>
<label for="sensitivity">less sensitive</label> <input type="radio" name="sensitivity">
