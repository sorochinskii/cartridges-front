<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body text-center">
          <h2 class="card-title">Verify Your Email</h2>
          <p class="card-text">
            We've sent a verification link to your email address.
            Please check your inbox and click on the link to verify your account.
          </p>
          <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerifyEmailView'
}
</script>
